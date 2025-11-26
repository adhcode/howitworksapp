import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, lte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { 
  landlordEscrowBalances, 
  tenantRentContracts,
  users,
  LandlordEscrowBalance,
  NewLandlordEscrowBalance,
  TenantRentContract
} from '../database/schema';

export interface PayoutResult {
  success: boolean;
  payoutType: 'immediate' | 'escrow';
  amount: number;
  transactionId?: string;
}

export interface EscrowReleaseResult {
  success: boolean;
  releasedAmount: number;
  escrowId: string;
  landlordId: string;
}

@Injectable()
export class LandlordPayoutService {
  private readonly logger = new Logger(LandlordPayoutService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  /**
   * Process immediate payout for monthly landlords
   * Credits the landlord's wallet immediately when tenant pays
   */
  async processImmediatePayout(
    landlordId: string, 
    amount: number, 
    contractId: string
  ): Promise<PayoutResult> {
    try {
      this.logger.log(`Processing immediate payout: ${amount} for landlord ${landlordId}, contract ${contractId}`);

      // Validate contract exists and belongs to landlord
      const [contract] = await this.db
        .select()
        .from(tenantRentContracts)
        .where(and(
          eq(tenantRentContracts.id, contractId),
          eq(tenantRentContracts.landlordId, landlordId),
          eq(tenantRentContracts.landlordPayoutType, 'monthly')
        ));

      if (!contract) {
        throw new Error(`Contract not found or not eligible for immediate payout: ${contractId}`);
      }

      // TODO: Integrate with existing wallet/payment system to credit landlord
      // For now, we'll log the transaction - this should be replaced with actual wallet credit
      this.logger.log(`Would credit landlord ${landlordId} wallet with ${amount} for contract ${contractId}`);

      // In a real implementation, this would:
      // 1. Credit the landlord's wallet balance
      // 2. Create a transaction record
      // 3. Send notification to landlord
      
      return {
        success: true,
        payoutType: 'immediate',
        amount,
        transactionId: `txn_${Date.now()}_${contractId}` // Mock transaction ID
      };
    } catch (error) {
      this.logger.error(`Error processing immediate payout: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Add payment to escrow for yearly payout accumulation
   * Stores tenant payments until contract expiry or 12 months
   */
  async addToEscrow(
    landlordId: string, 
    amount: number, 
    contractId: string
  ): Promise<PayoutResult> {
    try {
      this.logger.log(`Adding to escrow: ${amount} for landlord ${landlordId}, contract ${contractId}`);

      // Validate contract exists and belongs to landlord
      const [contract] = await this.db
        .select()
        .from(tenantRentContracts)
        .where(and(
          eq(tenantRentContracts.id, contractId),
          eq(tenantRentContracts.landlordId, landlordId),
          eq(tenantRentContracts.landlordPayoutType, 'yearly')
        ));

      if (!contract) {
        throw new Error(`Contract not found or not eligible for escrow: ${contractId}`);
      }

      // Check if escrow balance already exists for this contract
      const [existingEscrow] = await this.db
        .select()
        .from(landlordEscrowBalances)
        .where(and(
          eq(landlordEscrowBalances.contractId, contractId),
          eq(landlordEscrowBalances.isReleased, false)
        ));

      if (existingEscrow) {
        // Update existing escrow balance
        const newTotal = parseFloat(existingEscrow.totalEscrowed) + amount;
        const newMonthsAccumulated = existingEscrow.monthsAccumulated + 1;

        await this.db
          .update(landlordEscrowBalances)
          .set({
            totalEscrowed: newTotal.toString(),
            monthsAccumulated: newMonthsAccumulated,
            updatedAt: new Date(),
          })
          .where(eq(landlordEscrowBalances.id, existingEscrow.id));

        this.logger.log(`Updated escrow balance: ${newTotal} (${newMonthsAccumulated} months) for contract ${contractId}`);
      } else {
        // Create new escrow balance
        const expectedReleaseDate = new Date(contract.expiryDate);
        
        const newEscrow: NewLandlordEscrowBalance = {
          landlordId,
          contractId,
          totalEscrowed: amount.toString(),
          monthsAccumulated: 1,
          expectedReleaseDate,
          isReleased: false,
        };

        await this.db
          .insert(landlordEscrowBalances)
          .values(newEscrow);

        this.logger.log(`Created new escrow balance: ${amount} for contract ${contractId}, release date: ${expectedReleaseDate}`);
      }

      return {
        success: true,
        payoutType: 'escrow',
        amount,
      };
    } catch (error) {
      this.logger.error(`Error adding to escrow: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check for escrow balances ready for release
   * Called by scheduler to process contract expiries
   */
  async checkEscrowReleases(): Promise<EscrowReleaseResult[]> {
    try {
      this.logger.log('Checking for escrow balances ready for release');

      const today = new Date();
      
      // Find escrow balances that are ready for release (past expected release date)
      const readyForRelease = await this.db
        .select({
          escrow: landlordEscrowBalances,
          contract: tenantRentContracts,
        })
        .from(landlordEscrowBalances)
        .leftJoin(tenantRentContracts, eq(landlordEscrowBalances.contractId, tenantRentContracts.id))
        .where(and(
          eq(landlordEscrowBalances.isReleased, false),
          lte(landlordEscrowBalances.expectedReleaseDate, today)
        ));

      this.logger.log(`Found ${readyForRelease.length} escrow balances ready for release`);

      const results: EscrowReleaseResult[] = [];

      for (const item of readyForRelease) {
        try {
          const result = await this.releaseEscrowBalance(item.escrow.id);
          results.push(result);
        } catch (error) {
          this.logger.error(`Failed to release escrow ${item.escrow.id}: ${error.message}`);
          // Continue with other releases even if one fails
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Error checking escrow releases: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Release escrow balance with transaction safety
   * Transfers accumulated escrow to landlord's wallet
   */
  async releaseEscrowBalance(escrowId: string): Promise<EscrowReleaseResult> {
    try {
      this.logger.log(`Releasing escrow balance: ${escrowId}`);

      // Use transaction for safety
      return await this.db.transaction(async (tx: any) => {
        // Get escrow balance details
        const [escrow] = await tx
          .select()
          .from(landlordEscrowBalances)
          .where(and(
            eq(landlordEscrowBalances.id, escrowId),
            eq(landlordEscrowBalances.isReleased, false)
          ));

        if (!escrow) {
          throw new Error(`Escrow balance not found or already released: ${escrowId}`);
        }

        const releaseAmount = parseFloat(escrow.totalEscrowed);
        
        if (releaseAmount <= 0) {
          throw new Error(`Invalid release amount: ${releaseAmount}`);
        }

        // TODO: Credit landlord's wallet with the escrow amount
        // This should integrate with the existing wallet/payment system
        this.logger.log(`Would credit landlord ${escrow.landlordId} wallet with ${releaseAmount} from escrow ${escrowId}`);

        // Mark escrow as released
        await tx
          .update(landlordEscrowBalances)
          .set({
            isReleased: true,
            releasedAt: new Date(),
            releasedAmount: releaseAmount.toString(),
            updatedAt: new Date(),
          })
          .where(eq(landlordEscrowBalances.id, escrowId));

        this.logger.log(`Successfully released escrow: ${releaseAmount} to landlord ${escrow.landlordId}`);

        return {
          success: true,
          releasedAmount: releaseAmount,
          escrowId,
          landlordId: escrow.landlordId,
        };
      });
    } catch (error) {
      this.logger.error(`Error releasing escrow balance: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get landlord's escrow balances
   * Returns all escrow balances for a landlord (both active and released)
   */
  async getLandlordEscrowBalances(landlordId: string): Promise<LandlordEscrowBalance[]> {
    try {
      this.logger.log(`Getting escrow balances for landlord: ${landlordId}`);

      const escrowBalances = await this.db
        .select({
          escrow: landlordEscrowBalances,
          contract: tenantRentContracts,
        })
        .from(landlordEscrowBalances)
        .leftJoin(tenantRentContracts, eq(landlordEscrowBalances.contractId, tenantRentContracts.id))
        .where(eq(landlordEscrowBalances.landlordId, landlordId));

      this.logger.log(`Found ${escrowBalances.length} escrow balances for landlord ${landlordId}`);

      return escrowBalances.map(item => ({
        ...item.escrow,
        contract: item.contract,
      })) as any;
    } catch (error) {
      this.logger.error(`Error getting landlord escrow balances: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get total escrowed amount for a landlord
   * Returns sum of all active (unreleased) escrow balances
   */
  async getTotalEscrowedAmount(landlordId: string): Promise<number> {
    try {
      this.logger.log(`Getting total escrowed amount for landlord: ${landlordId}`);

      const [result] = await this.db
        .select({
          total: sql<string>`COALESCE(SUM(${landlordEscrowBalances.totalEscrowed}), 0)`,
        })
        .from(landlordEscrowBalances)
        .where(and(
          eq(landlordEscrowBalances.landlordId, landlordId),
          eq(landlordEscrowBalances.isReleased, false)
        ));

      const totalAmount = parseFloat(result?.total || '0');
      
      this.logger.log(`Total escrowed amount for landlord ${landlordId}: ${totalAmount}`);
      
      return totalAmount;
    } catch (error) {
      this.logger.error(`Error getting total escrowed amount: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get escrow balance by contract ID
   * Helper method to get escrow details for a specific contract
   */
  async getEscrowByContractId(contractId: string): Promise<LandlordEscrowBalance | null> {
    try {
      const [escrow] = await this.db
        .select()
        .from(landlordEscrowBalances)
        .where(and(
          eq(landlordEscrowBalances.contractId, contractId),
          eq(landlordEscrowBalances.isReleased, false)
        ));

      return escrow || null;
    } catch (error) {
      this.logger.error(`Error getting escrow by contract ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Force release escrow balance (for early contract termination)
   * Allows manual release of escrow before expected date
   */
  async forceReleaseEscrow(contractId: string, reason?: string): Promise<EscrowReleaseResult> {
    try {
      this.logger.log(`Force releasing escrow for contract: ${contractId}, reason: ${reason}`);

      const escrow = await this.getEscrowByContractId(contractId);
      
      if (!escrow) {
        throw new Error(`No active escrow found for contract: ${contractId}`);
      }

      // Log the reason for force release
      this.logger.log(`Force releasing escrow ${escrow.id} for reason: ${reason || 'Manual release'}`);

      return await this.releaseEscrowBalance(escrow.id);
    } catch (error) {
      this.logger.error(`Error force releasing escrow: ${error.message}`, error.stack);
      throw error;
    }
  }
}
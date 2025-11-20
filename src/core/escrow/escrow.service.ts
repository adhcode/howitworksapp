import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, lte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { 
  landlordEscrowBalances,
  tenantRentContracts,
} from '../../database/schema/tenant-rent-contracts';
import { BUSINESS_RULES } from '../../shared/constants/business-rules.constant';
import { startOfDay, addDays, isBefore } from '../../shared/utils/date.utils';

/**
 * ESCROW MANAGEMENT SERVICE
 * 
 * Manages escrow accounts for landlords with yearly payout preferences.
 * 
 * Flow:
 * 1. Tenant pays rent monthly
 * 2. Money accumulates in escrow
 * 3. After 12 months OR when contract expires, money is released to landlord
 * 4. Cron job runs daily to check for escrow ready to release
 * 
 * Key responsibilities:
 * 1. Check escrow balances ready for release
 * 2. Release escrow to landlord wallet
 * 3. Track escrow accumulation and release history
 * 4. Handle contract expiry triggers
 */
@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * DAILY CRON JOB: CHECK AND RELEASE ESCROW
   * 
   * Runs daily at 2:00 AM to check for escrow balances ready to release.
   * 
   * Release conditions:
   * 1. 12 months have accumulated, OR
   * 2. Contract has expired (+ grace period)
   * 
   * Steps:
   * 1. Find all unreleased escrow balances
   * 2. Check if ready for release
   * 3. Release to landlord wallet
   * 4. Mark as released
   * 5. Send notification to landlord
   */
  @Cron('0 2 * * *')
  async checkAndReleaseEscrow(): Promise<void> {
    this.logger.log('🏦 Starting escrow release check...');

    try {
      const today = startOfDay(new Date());

      // Get all unreleased escrow balances
      const unreleasedEscrow = await this.db
        .select()
        .from(landlordEscrowBalances)
        .where(eq(landlordEscrowBalances.isReleased, false));

      this.logger.log(`Found ${unreleasedEscrow.length} unreleased escrow accounts`);

      let releasedCount = 0;

      for (const escrow of unreleasedEscrow) {
        // Check if ready for release
        const readyForRelease = await this.isReadyForRelease(escrow, today);

        if (readyForRelease) {
          await this.releaseEscrow(escrow.id);
          releasedCount++;
        }
      }

      this.logger.log(`✅ Escrow release check completed. Released: ${releasedCount}`);
    } catch (error) {
      this.logger.error(`❌ Error during escrow release check: ${error.message}`, error.stack);
    }
  }

  /**
   * CHECK IF ESCROW IS READY FOR RELEASE
   * 
   * Release conditions:
   * 1. Has accumulated for 12+ months, OR
   * 2. Related contract has expired (with grace period)
   * 
   * @param escrow - Escrow balance record
   * @param today - Current date
   * @returns True if ready to release
   */
  private async isReadyForRelease(
    escrow: typeof landlordEscrowBalances.$inferSelect,
    today: Date
  ): Promise<boolean> {
    // Condition 1: 12 months accumulated
    if (escrow.monthsAccumulated >= BUSINESS_RULES.ESCROW.AUTO_RELEASE_MONTHS) {
      this.logger.log(`Escrow ${escrow.id}: Ready (12 months accumulated)`);
      return true;
    }

    // Condition 2: Contract expired
    if (BUSINESS_RULES.ESCROW.RELEASE_ON_CONTRACT_EXPIRY) {
      const [contract] = await this.db
        .select()
        .from(tenantRentContracts)
        .where(eq(tenantRentContracts.id, escrow.contractId))
        .limit(1);

      if (contract) {
        const contractExpiry = new Date(contract.expiryDate);
        const releaseDate = addDays(contractExpiry, BUSINESS_RULES.ESCROW.GRACE_DAYS_AFTER_EXPIRY);

        if (isBefore(releaseDate, today) || releaseDate.getTime() === today.getTime()) {
          this.logger.log(`Escrow ${escrow.id}: Ready (contract expired + grace period)`);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * RELEASE ESCROW TO LANDLORD
   * 
   * Transfers accumulated escrow balance to landlord's wallet.
   * 
   * TODO: Integrate with wallet system
   * For now, logs the transaction.
   * 
   * @param escrowId - Escrow balance ID
   */
  async releaseEscrow(escrowId: string): Promise<void> {
    const [escrow] = await this.db
      .select()
      .from(landlordEscrowBalances)
      .where(eq(landlordEscrowBalances.id, escrowId))
      .limit(1);

    if (!escrow || escrow.isReleased) {
      this.logger.warn(`Escrow ${escrowId} not found or already released`);
      return;
    }

    const amount = parseFloat(escrow.totalEscrowed);

    this.logger.log(`💰 Releasing escrow ${escrowId}: $${amount} to landlord ${escrow.landlordId}`);

    try {
      // TODO: Integrate with wallet system
      // await this.walletService.credit(escrow.landlordId, amount, {
      //   type: 'escrow_release',
      //   escrowId,
      //   contractId: escrow.contractId,
      //   monthsAccumulated: escrow.monthsAccumulated,
      // });

      // Mark as released
      await this.db
        .update(landlordEscrowBalances)
        .set({
          isReleased: true,
          releasedAt: new Date(),
          releasedAmount: amount.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(landlordEscrowBalances.id, escrowId));

      this.logger.log(`✅ Escrow released successfully: ${escrowId}`);

      // TODO: Send notification to landlord
      // await this.notificationService.sendEscrowReleaseNotification(
      //   escrow.landlordId,
      //   amount,
      //   escrow.monthsAccumulated
      // );
    } catch (error) {
      this.logger.error(`❌ Failed to release escrow ${escrowId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * GET ESCROW BALANCE FOR LANDLORD
   * 
   * Returns all escrow balances (released and unreleased) for a landlord.
   * 
   * @param landlordId - Landlord ID
   * @returns Escrow balances
   */
  async getEscrowBalances(landlordId: string): Promise<any[]> {
    return this.db
      .select()
      .from(landlordEscrowBalances)
      .where(eq(landlordEscrowBalances.landlordId, landlordId))
      .orderBy(sql`${landlordEscrowBalances.createdAt} DESC`);
  }

  /**
   * GET UNRELEASED ESCROW TOTAL FOR LANDLORD
   * 
   * Calculates total amount in escrow (not yet released).
   * 
   * @param landlordId - Landlord ID
   * @returns Total unreleased amount
   */
  async getUnreleasedTotal(landlordId: string): Promise<number> {
    const unreleased = await this.db
      .select()
      .from(landlordEscrowBalances)
      .where(
        and(
          eq(landlordEscrowBalances.landlordId, landlordId),
          eq(landlordEscrowBalances.isReleased, false)
        )
      );

    return unreleased.reduce((total, escrow) => {
      return total + parseFloat(escrow.totalEscrowed);
    }, 0);
  }

  /**
   * GET ESCROW DETAILS BY CONTRACT
   * 
   * Returns escrow details for a specific contract.
   * 
   * @param contractId - Contract ID
   * @returns Escrow balance or null
   */
  async getEscrowByContract(contractId: string): Promise<any | null> {
    const [escrow] = await this.db
      .select()
      .from(landlordEscrowBalances)
      .where(
        and(
          eq(landlordEscrowBalances.contractId, contractId),
          eq(landlordEscrowBalances.isReleased, false)
        )
      )
      .limit(1);

    return escrow || null;
  }
}


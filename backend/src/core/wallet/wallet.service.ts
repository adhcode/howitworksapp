import { Injectable, Inject, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { 
  landlordWalletBalances, 
  walletTransactions,
  NewLandlordWalletBalance,
  NewWalletTransaction,
} from '../../database/schema/wallet';

/**
 * WALLET SERVICE
 * 
 * Manages landlord wallet balances and transactions.
 * Handles credits, debits, and withdrawal processing.
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * GET OR CREATE WALLET BALANCE
   * 
   * Gets existing wallet or creates new one for landlord.
   */
  async getOrCreateWallet(landlordId: string) {
    // Try to get existing wallet
    const [existing] = await this.db
      .select()
      .from(landlordWalletBalances)
      .where(eq(landlordWalletBalances.landlordId, landlordId))
      .limit(1);

    if (existing) {
      return existing;
    }

    // Create new wallet
    const newWallet: NewLandlordWalletBalance = {
      landlordId,
      availableBalance: '0.00',
      pendingBalance: '0.00',
      totalEarned: '0.00',
      totalWithdrawn: '0.00',
      currency: 'NGN',
    };

    const [created] = await this.db
      .insert(landlordWalletBalances)
      .values(newWallet)
      .returning();

    this.logger.log(`✅ Created new wallet for landlord ${landlordId}`);
    return created;
  }

  /**
   * CREDIT WALLET
   * 
   * Adds money to landlord's available balance.
   * Used when tenant makes a payment.
   */
  async credit(
    landlordId: string,
    amount: number,
    metadata: {
      type: string;
      contractId?: string;
      paymentId?: string;
      reference?: string;
      description?: string;
    }
  ) {
    this.logger.log(`💰 Crediting wallet: ${landlordId} - ₦${amount}`);

    // Get or create wallet
    const wallet = await this.getOrCreateWallet(landlordId);

    const balanceBefore = parseFloat(wallet.availableBalance);
    const balanceAfter = balanceBefore + amount;
    const newTotalEarned = parseFloat(wallet.totalEarned) + amount;

    // Create transaction record
    const transaction: NewWalletTransaction = {
      landlordId,
      type: 'credit',
      amount: amount.toFixed(2),
      balanceBefore: balanceBefore.toFixed(2),
      balanceAfter: balanceAfter.toFixed(2),
      reference: metadata.reference,
      paymentId: metadata.paymentId,
      status: 'completed',
      description: metadata.description || `Credit from ${metadata.type}`,
      metadata: JSON.stringify(metadata),
    };

    const [createdTransaction] = await this.db
      .insert(walletTransactions)
      .values(transaction)
      .returning();

    // Update wallet balance
    await this.db
      .update(landlordWalletBalances)
      .set({
        availableBalance: balanceAfter.toFixed(2),
        totalEarned: newTotalEarned.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(landlordWalletBalances.landlordId, landlordId));

    this.logger.log(`✅ Wallet credited: ${landlordId} - Balance: ₦${balanceAfter}`);

    return createdTransaction;
  }

  /**
   * DEBIT WALLET
   * 
   * Removes money from landlord's available balance.
   * Used for withdrawals or refunds.
   */
  async debit(
    landlordId: string,
    amount: number,
    metadata: {
      type: string;
      reference?: string;
      description?: string;
    }
  ) {
    this.logger.log(`💸 Debiting wallet: ${landlordId} - ₦${amount}`);

    // Get wallet
    const wallet = await this.getOrCreateWallet(landlordId);

    const balanceBefore = parseFloat(wallet.availableBalance);

    // Check sufficient balance
    if (balanceBefore < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${balanceBefore}, Required: ₦${amount}`
      );
    }

    const balanceAfter = balanceBefore - amount;
    const newTotalWithdrawn = parseFloat(wallet.totalWithdrawn) + amount;

    // Create transaction record
    const transaction: NewWalletTransaction = {
      landlordId,
      type: metadata.type === 'withdrawal' ? 'withdrawal' : 'debit',
      amount: amount.toFixed(2),
      balanceBefore: balanceBefore.toFixed(2),
      balanceAfter: balanceAfter.toFixed(2),
      reference: metadata.reference,
      status: 'completed',
      description: metadata.description || `Debit for ${metadata.type}`,
      metadata: JSON.stringify(metadata),
    };

    const [createdTransaction] = await this.db
      .insert(walletTransactions)
      .values(transaction)
      .returning();

    // Update wallet balance
    await this.db
      .update(landlordWalletBalances)
      .set({
        availableBalance: balanceAfter.toFixed(2),
        totalWithdrawn: newTotalWithdrawn.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(landlordWalletBalances.landlordId, landlordId));

    this.logger.log(`✅ Wallet debited: ${landlordId} - Balance: ₦${balanceAfter}`);

    return createdTransaction;
  }

  /**
   * GET WALLET BALANCE
   * 
   * Returns current wallet balance for landlord.
   */
  async getBalance(landlordId: string) {
    const wallet = await this.getOrCreateWallet(landlordId);

    return {
      availableBalance: parseFloat(wallet.availableBalance),
      pendingBalance: parseFloat(wallet.pendingBalance),
      totalEarned: parseFloat(wallet.totalEarned),
      totalWithdrawn: parseFloat(wallet.totalWithdrawn),
      currency: wallet.currency,
    };
  }

  /**
   * GET TRANSACTION HISTORY
   * 
   * Returns wallet transaction history for landlord.
   */
  async getTransactions(
    landlordId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
    }
  ) {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    let query = this.db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.landlordId, landlordId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    const transactions = await query;

    return transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount),
      balanceBefore: parseFloat(t.balanceBefore),
      balanceAfter: parseFloat(t.balanceAfter),
      metadata: t.metadata ? JSON.parse(t.metadata) : null,
    }));
  }

  /**
   * GET TRANSACTION BY ID
   * 
   * Returns specific transaction details.
   */
  async getTransaction(transactionId: string, landlordId: string) {
    const [transaction] = await this.db
      .select()
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.id, transactionId),
          eq(walletTransactions.landlordId, landlordId)
        )
      )
      .limit(1);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      ...transaction,
      amount: parseFloat(transaction.amount),
      balanceBefore: parseFloat(transaction.balanceBefore),
      balanceAfter: parseFloat(transaction.balanceAfter),
      metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null,
    };
  }
}

import { pgTable, uuid, varchar, decimal, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { payments } from './payments';

// Transaction types
export const transactionTypeEnum = pgEnum('transaction_type', [
  'credit',
  'debit',
  'withdrawal',
  'refund',
  'fee',
]);

// Transaction status
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'completed',
  'failed',
  'cancelled',
]);

// Landlord wallet balances
export const landlordWalletBalances = pgTable('landlord_wallet_balances', {
  id: uuid('id').defaultRandom().primaryKey(),
  landlordId: uuid('landlord_id').references(() => users.id).notNull().unique(),
  
  // Balance tracking
  availableBalance: decimal('available_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  pendingBalance: decimal('pending_balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalEarned: decimal('total_earned', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalWithdrawn: decimal('total_withdrawn', { precision: 12, scale: 2 }).default('0.00').notNull(),
  
  currency: varchar('currency', { length: 3 }).default('NGN').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Wallet transactions
export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  
  // Transaction details
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal('balance_before', { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 12, scale: 2 }).notNull(),
  
  // References
  reference: varchar('reference', { length: 255 }),
  paymentId: uuid('payment_id').references(() => payments.id),
  
  // Status and metadata
  status: transactionStatusEnum('status').default('completed').notNull(),
  description: text('description'),
  metadata: text('metadata'), // JSON string
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type LandlordWalletBalance = typeof landlordWalletBalances.$inferSelect;
export type NewLandlordWalletBalance = typeof landlordWalletBalances.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;

import { pgTable, uuid, varchar, text, timestamp, decimal, boolean, pgEnum, integer, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { properties, units } from './properties';

export const landlordPayoutTypeEnum = pgEnum('landlord_payout_type', ['monthly', 'yearly']);
export const contractStatusEnum = pgEnum('contract_status', ['active', 'expired', 'terminated']);
export const notificationTypeEnum = pgEnum('notification_type', ['reminder', 'overdue', 'success']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed']);

// Main tenant rent contracts table
export const tenantRentContracts = pgTable('tenant_rent_contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // References
  tenantId: uuid('tenant_id').references(() => users.id).notNull(),
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  unitId: uuid('unit_id').references(() => units.id).notNull(),
  
  // Contract details
  monthlyAmount: decimal('monthly_amount', { precision: 10, scale: 2 }).notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  landlordPayoutType: landlordPayoutTypeEnum('landlord_payout_type').notNull(),
  
  // Payment scheduling
  nextPaymentDue: timestamp('next_payment_due').notNull(),
  transitionStartDate: timestamp('transition_start_date').notNull(),
  
  // Status and metadata
  status: contractStatusEnum('status').default('active').notNull(),
  isExistingTenant: boolean('is_existing_tenant').default(false).notNull(),
  originalExpiryDate: timestamp('original_expiry_date'), // For existing tenants
  
  // Tracking
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Landlord escrow balances for yearly payout tracking
export const landlordEscrowBalances = pgTable('landlord_escrow_balances', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // References
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  contractId: uuid('contract_id').references(() => tenantRentContracts.id).notNull(),
  
  // Balance tracking
  totalEscrowed: decimal('total_escrowed', { precision: 10, scale: 2 }).default('0.00').notNull(),
  monthsAccumulated: integer('months_accumulated').default(0).notNull(),
  expectedReleaseDate: timestamp('expected_release_date').notNull(),
  
  // Release tracking
  isReleased: boolean('is_released').default(false).notNull(),
  releasedAt: timestamp('released_at'),
  releasedAmount: decimal('released_amount', { precision: 10, scale: 2 }),
  
  // Tracking
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payment notifications for scheduling
export const paymentNotifications = pgTable('payment_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // References
  contractId: uuid('contract_id').references(() => tenantRentContracts.id).notNull(),
  tenantId: uuid('tenant_id').references(() => users.id).notNull(),
  
  // Notification details
  notificationType: notificationTypeEnum('notification_type').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  sentAt: timestamp('sent_at'),
  
  // Notification content
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  // Delivery tracking
  status: notificationStatusEnum('status').default('pending').notNull(),
  expoReceiptId: varchar('expo_receipt_id', { length: 255 }),
  
  // Tracking
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type TenantRentContract = typeof tenantRentContracts.$inferSelect;
export type NewTenantRentContract = typeof tenantRentContracts.$inferInsert;
export type LandlordEscrowBalance = typeof landlordEscrowBalances.$inferSelect;
export type NewLandlordEscrowBalance = typeof landlordEscrowBalances.$inferInsert;
export type PaymentNotification = typeof paymentNotifications.$inferSelect;
export type NewPaymentNotification = typeof paymentNotifications.$inferInsert;
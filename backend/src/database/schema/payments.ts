import { pgTable, uuid, varchar, text, timestamp, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { properties, units } from './properties';
import { tenantInvitations } from './tenant-invitations';

export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue', 'partial']);
export const paymentMethodEnum = pgEnum('payment_method', ['bank_transfer', 'cash', 'check', 'online', 'card']);

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // References
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  tenantId: uuid('tenant_id').references(() => users.id).notNull(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  unitId: uuid('unit_id').references(() => units.id).notNull(),
  tenantInvitationId: uuid('tenant_invitation_id').references(() => tenantInvitations.id),
  
  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).default('0.00'),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  
  // Payment info
  paymentType: varchar('payment_type', { length: 50 }).default('rent'), // rent, deposit, utilities, etc.
  paymentMethod: paymentMethodEnum('payment_method'),
  status: paymentStatusEnum('status').default('pending'),
  
  // Additional info
  description: text('description'),
  notes: text('notes'),
  receiptNumber: varchar('receipt_number', { length: 100 }),
  
  // Payment gateway info
  paystackReference: varchar('paystack_reference', { length: 255 }),
  paystackStatus: varchar('paystack_status', { length: 50 }),
  paymentGateway: varchar('payment_gateway', { length: 50 }).default('paystack'),
  
  // Tracking
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payment history for tracking changes and audit trail
export const paymentHistory = pgTable('payment_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id').references(() => payments.id).notNull(),
  
  // What changed
  action: varchar('action', { length: 50 }).notNull(), // created, updated, paid, overdue
  previousStatus: paymentStatusEnum('previous_status'),
  newStatus: paymentStatusEnum('new_status'),
  
  // Amount changes
  previousAmount: decimal('previous_amount', { precision: 10, scale: 2 }),
  newAmount: decimal('new_amount', { precision: 10, scale: 2 }),
  
  // Additional info
  notes: text('notes'),
  performedBy: uuid('performed_by').references(() => users.id),
  
  createdAt: timestamp('created_at').defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type NewPaymentHistory = typeof paymentHistory.$inferInsert;
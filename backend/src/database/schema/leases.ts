import { pgTable, uuid, varchar, text, timestamp, decimal, date, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { properties, units } from './properties';

export const leaseStatusEnum = pgEnum('lease_status', ['active', 'expired', 'terminated', 'pending']);

export const leases = pgTable('leases', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => users.id).notNull(),
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  unitId: uuid('unit_id').references(() => units.id).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  monthlyRent: decimal('monthly_rent', { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal('security_deposit', { precision: 10, scale: 2 }),
  status: leaseStatusEnum('status').default('pending'),
  terms: text('terms'),
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;
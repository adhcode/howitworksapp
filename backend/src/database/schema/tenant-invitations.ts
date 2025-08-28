import { pgTable, uuid, varchar, text, timestamp, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { properties, units } from './properties';

export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired', 'cancelled']);

export const tenantInvitations = pgTable('tenant_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  invitationToken: varchar('invitation_token', { length: 255 }).unique().notNull(),
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  unitId: uuid('unit_id').references(() => units.id).notNull(),
  
  // Pre-filled tenant information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  emergencyContact: varchar('emergency_contact', { length: 100 }),
  emergencyPhone: varchar('emergency_phone', { length: 20 }),
  
  // Lease information
  leaseStartDate: timestamp('lease_start_date').notNull(),
  leaseEndDate: timestamp('lease_end_date').notNull(),
  monthlyRent: decimal('monthly_rent', { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal('security_deposit', { precision: 10, scale: 2 }),
  notes: text('notes'),
  
  // Invitation status and tracking
  status: invitationStatusEnum('status').default('pending'),
  tenantId: uuid('tenant_id').references(() => users.id), // Set when tenant accepts
  sentAt: timestamp('sent_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  expiresAt: timestamp('expires_at').notNull(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type NewTenantInvitation = typeof tenantInvitations.$inferInsert;
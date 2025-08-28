import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { properties } from './properties';

export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const requestPriorityEnum = pgEnum('request_priority', ['low', 'medium', 'high', 'urgent']);

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  receiverId: uuid('receiver_id').references(() => users.id).notNull(),
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  status: messageStatusEnum('status').default('sent'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const maintenanceRequests = pgTable('maintenance_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => users.id).notNull(),
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  priority: requestPriorityEnum('priority').default('medium'),
  status: requestStatusEnum('status').default('pending'),
  images: text('images').array(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type NewMaintenanceRequest = typeof maintenanceRequests.$inferInsert;
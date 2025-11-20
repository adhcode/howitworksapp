import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const propertyTypeEnum = pgEnum('property_type', ['apartment', 'house', 'condo', 'studio', 'duplex']);
export const propertyStatusEnum = pgEnum('property_status', ['active', 'inactive', 'maintenance']);

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  landlordId: uuid('landlord_id').references(() => users.id).notNull(),
  facilitatorId: uuid('facilitator_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  zipCode: varchar('zip_code', { length: 10 }),
  country: varchar('country', { length: 100 }).notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  description: text('description'),
  totalUnits: integer('total_units').default(1),
  images: text('images').array(),
  amenities: text('amenities').array(),
  status: propertyStatusEnum('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const units = pgTable('units', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  unitNumber: varchar('unit_number', { length: 50 }).notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: decimal('bathrooms', { precision: 3, scale: 1 }).notNull(),
  squareFootage: decimal('square_footage', { precision: 10, scale: 2 }),
  rent: decimal('rent', { precision: 10, scale: 2 }).notNull(),
  deposit: decimal('deposit', { precision: 10, scale: 2 }),
  description: text('description'),
  images: text('images').array(),
  amenities: text('amenities').array(),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert; 
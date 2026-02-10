import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const artisans = pgTable('artisans', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(),
  yearsOfExperience: integer('years_of_experience').notNull(),
  refereeName: varchar('referee_name', { length: 255 }).notNull(),
  refereePhone: varchar('referee_phone', { length: 20 }).notNull(),
  additionalSkills: text('additional_skills'),
  availability: varchar('availability', { length: 50 }).default('Full-time'),
  status: varchar('status', { length: 20 }).default('pending'),
  referredByFacilitatorId: uuid('referred_by_facilitator_id').references(() => users.id, { onDelete: 'set null' }),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Artisan = typeof artisans.$inferSelect;
export type NewArtisan = typeof artisans.$inferInsert;

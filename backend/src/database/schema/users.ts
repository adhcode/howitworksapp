import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['landlord', 'tenant', 'admin', 'facilitator']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  role: userRoleEnum('role').notNull(),
  nextOfKinName: varchar('next_of_kin_name', { length: 100 }),
  nextOfKinPhone: varchar('next_of_kin_phone', { length: 20 }),
  nextOfKinRelationship: varchar('next_of_kin_relationship', { length: 50 }),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true),
  isEmailVerified: boolean('is_email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  emailVerificationCode: varchar('email_verification_code', { length: 6 }),
  emailVerificationCodeExpires: timestamp('email_verification_code_expires'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  passwordResetCode: varchar('password_reset_code', { length: 6 }),
  passwordResetCodeExpires: timestamp('password_reset_code_expires'),
  
  // Paystack payment fields (for tenants - recurring payments)
  paystackAuthorizationCode: varchar('paystack_authorization_code', { length: 255 }),
  paystackCardLast4: varchar('paystack_card_last4', { length: 4 }),
  paystackCardBrand: varchar('paystack_card_brand', { length: 50 }),
  paystackCardBank: varchar('paystack_card_bank', { length: 100 }),
  
  // Paystack payout fields (for landlords - cashouts)
  paystackRecipientCode: varchar('paystack_recipient_code', { length: 255 }),
  bankAccountName: varchar('bank_account_name', { length: 255 }),
  bankAccountNumber: varchar('bank_account_number', { length: 20 }),
  bankCode: varchar('bank_code', { length: 10 }),
  
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert; 
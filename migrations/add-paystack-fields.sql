-- ==========================================
-- PAYSTACK INTEGRATION - DATABASE MIGRATION
-- ==========================================
-- Run this to add Paystack fields to users table

-- Add Paystack fields for tenant recurring payments
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_authorization_code VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_card_last4 VARCHAR(4);
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_card_brand VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_card_bank VARCHAR(100);

-- Add Paystack fields for landlord payouts
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_recipient_code VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_paystack_auth ON users(paystack_authorization_code);
CREATE INDEX IF NOT EXISTS idx_users_paystack_recipient ON users(paystack_recipient_code);

-- Verify columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'paystack%' OR column_name LIKE 'bank_%'
ORDER BY column_name;




-- Add email verification code columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verification_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS email_verification_code_expires TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_code ON users(email_verification_code);

-- Add password reset code fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_code_expires TIMESTAMP;

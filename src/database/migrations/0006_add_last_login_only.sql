-- Add last_login_at column only if it doesn't exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;
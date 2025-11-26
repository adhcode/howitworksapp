-- Migration: Make tenant_invitation_id nullable in payments table
-- This allows creating payment records for rent contracts without requiring a tenant invitation

ALTER TABLE payments 
ALTER COLUMN tenant_invitation_id DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN payments.tenant_invitation_id IS 'Optional reference to tenant invitation. Null for payments created from rent contracts.';

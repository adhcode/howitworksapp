-- Add invitation token column to tenant_invitations table
-- This allows landlords to view the token after initial generation

ALTER TABLE tenant_invitations 
ADD COLUMN IF NOT EXISTS stored_token VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_stored_token 
ON tenant_invitations(stored_token);

-- Add comment
COMMENT ON COLUMN tenant_invitations.stored_token IS 'Copy of invitation token for landlord reference (token is already in invitation_token column)';

-- Note: The invitation_token column already exists, but we're adding this for clarity
-- Actually, let's just use the existing invitation_token column that's already there!

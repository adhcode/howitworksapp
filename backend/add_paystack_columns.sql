-- Add Paystack tracking columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS paystack_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50) DEFAULT 'paystack';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_paystack_reference ON payments(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_status ON payments(tenant_id, status);

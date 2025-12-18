-- Add indexes to speed up payment queries

-- Index for landlord payment queries
CREATE INDEX IF NOT EXISTS idx_payments_landlord_status 
ON payments(landlord_id, status);

-- Index for paid date queries
CREATE INDEX IF NOT EXISTS idx_payments_paid_date 
ON payments(paid_date) WHERE status = 'paid';

-- Index for tenant rent contracts
CREATE INDEX IF NOT EXISTS idx_tenant_rent_contracts_landlord_status 
ON tenant_rent_contracts(landlord_id, status);

-- Index for tenant rent contracts next payment due
CREATE INDEX IF NOT EXISTS idx_tenant_rent_contracts_next_payment 
ON tenant_rent_contracts(next_payment_due) WHERE status = 'active';

SELECT 'Payment indexes created successfully!' as status;

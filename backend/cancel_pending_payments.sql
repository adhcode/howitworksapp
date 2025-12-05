-- Cancel all pending Paystack payments
-- Use this for testing or to clear stuck payments

UPDATE payments 
SET status = 'overdue', 
    updated_at = NOW()
WHERE status = 'pending' 
  AND payment_gateway = 'paystack';

-- Show what was updated
SELECT id, tenant_id, amount, status, created_at, paystack_reference
FROM payments 
WHERE payment_gateway = 'paystack'
ORDER BY created_at DESC
LIMIT 10;

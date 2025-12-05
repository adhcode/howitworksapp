-- =====================================================
-- Fix Test Payment Dates
-- =====================================================
-- This script updates test contracts to have future payment dates
-- Run this to stop receiving overdue payment reminder emails
-- =====================================================

-- 1. Check current overdue contracts
SELECT 
  id,
  tenant_id,
  next_payment_due,
  monthly_amount,
  status,
  CURRENT_DATE - next_payment_due::date as days_overdue
FROM tenant_rent_contracts
WHERE status = 'active'
  AND next_payment_due < CURRENT_DATE
ORDER BY next_payment_due;

-- 2. Update all active contracts to have next payment due in 25 days
UPDATE tenant_rent_contracts
SET next_payment_due = CURRENT_DATE + INTERVAL '25 days'
WHERE status = 'active'
  AND next_payment_due < CURRENT_DATE;

-- 3. Verify the update
SELECT 
  id,
  tenant_id,
  next_payment_due,
  monthly_amount,
  status,
  next_payment_due::date - CURRENT_DATE as days_until_due
FROM tenant_rent_contracts
WHERE status = 'active'
ORDER BY next_payment_due;

-- =====================================================
-- Alternative: Set specific due date (1st of next month)
-- =====================================================

-- Uncomment to use this instead:
-- UPDATE tenant_rent_contracts
-- SET next_payment_due = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
-- WHERE status = 'active'
--   AND next_payment_due < CURRENT_DATE;

-- =====================================================
-- To disable a specific contract (mark as terminated)
-- =====================================================

-- Uncomment and replace CONTRACT_ID:
-- UPDATE tenant_rent_contracts
-- SET status = 'terminated'
-- WHERE id = 'CONTRACT_ID';

-- =====================================================

-- Migration: Add performance indexes for tenant rent contracts system
-- Created: 2024-12-16
-- Description: Adds composite indexes, partial indexes, and covering indexes for optimal query performance

-- ============================================================================
-- TENANT RENT CONTRACTS PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_landlord_status 
ON tenant_rent_contracts (landlord_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_tenant_status 
ON tenant_rent_contracts (tenant_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_status_payment_due 
ON tenant_rent_contracts (status, next_payment_due);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_landlord_payout_type 
ON tenant_rent_contracts (landlord_id, landlord_payout_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_property_unit 
ON tenant_rent_contracts (property_id, unit_id);

-- Performance indexes for scheduler queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_active_payment_due 
ON tenant_rent_contracts (status, next_payment_due, tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_expiring 
ON tenant_rent_contracts (status, expiry_date, landlord_payout_type);

-- Covering index for common contract lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_lookup 
ON tenant_rent_contracts (id, tenant_id, landlord_id, status);

-- Partial indexes for specific use cases
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_active_only 
ON tenant_rent_contracts (tenant_id, next_payment_due) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_yearly_payout 
ON tenant_rent_contracts (landlord_id, expiry_date) 
WHERE landlord_payout_type = 'yearly' AND status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_existing_tenants 
ON tenant_rent_contracts (transition_start_date, tenant_id) 
WHERE is_existing_tenant = true;

-- ============================================================================
-- LANDLORD ESCROW BALANCES PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for escrow queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_landlord_released 
ON landlord_escrow_balances (landlord_id, is_released);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_release_date_status 
ON landlord_escrow_balances (expected_release_date, is_released);

-- Performance index for scheduler escrow release queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_pending_releases 
ON landlord_escrow_balances (is_released, expected_release_date, landlord_id);

-- Covering index for landlord escrow lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_lookup 
ON landlord_escrow_balances (landlord_id, contract_id, is_released, total_escrowed);

-- Partial indexes for specific escrow scenarios
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_unreleased 
ON landlord_escrow_balances (landlord_id, expected_release_date, total_escrowed) 
WHERE is_released = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_ready_for_release 
ON landlord_escrow_balances (landlord_id, contract_id) 
WHERE is_released = false AND expected_release_date <= CURRENT_DATE;

-- ============================================================================
-- PAYMENT NOTIFICATIONS PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for notification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_status_scheduled 
ON payment_notifications (status, scheduled_for);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_tenant_status 
ON payment_notifications (tenant_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_contract_status 
ON payment_notifications (contract_id, status);

-- Performance indexes for scheduler notification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_pending 
ON payment_notifications (status, scheduled_for, tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_type_scheduled 
ON payment_notifications (notification_type, scheduled_for, status);

-- Covering index for notification processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_processing 
ON payment_notifications (status, scheduled_for, contract_id, tenant_id);

-- Partial indexes for notification scenarios
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_pending_only 
ON payment_notifications (scheduled_for, tenant_id, notification_type) 
WHERE status = 'pending';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_overdue 
ON payment_notifications (tenant_id, created_at) 
WHERE notification_type = 'overdue' AND status = 'sent';

-- ============================================================================
-- CROSS-TABLE PERFORMANCE INDEXES
-- ============================================================================

-- Index for joining contracts with escrow balances
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_escrow_contract_join 
ON landlord_escrow_balances (contract_id, landlord_id, is_released);

-- Index for joining contracts with notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_contract_join 
ON payment_notifications (contract_id, tenant_id, status);

-- ============================================================================
-- MAINTENANCE AND MONITORING
-- ============================================================================

-- Create a function to monitor index usage
CREATE OR REPLACE FUNCTION get_tenant_contract_index_usage()
RETURNS TABLE (
    schemaname text,
    tablename text,
    indexname text,
    idx_scan bigint,
    idx_tup_read bigint,
    idx_tup_fetch bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::text,
        s.tablename::text,
        s.indexname::text,
        s.idx_scan,
        s.idx_tup_read,
        s.idx_tup_fetch
    FROM pg_stat_user_indexes s
    JOIN pg_index i ON s.indexrelid = i.indexrelid
    WHERE s.tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to identify unused indexes
CREATE OR REPLACE FUNCTION get_unused_tenant_contract_indexes()
RETURNS TABLE (
    schemaname text,
    tablename text,
    indexname text,
    index_size text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::text,
        s.tablename::text,
        s.indexname::text,
        pg_size_pretty(pg_relation_size(s.indexrelid))::text as index_size
    FROM pg_stat_user_indexes s
    JOIN pg_index i ON s.indexrelid = i.indexrelid
    WHERE s.tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    AND s.idx_scan = 0
    AND NOT i.indisunique
    ORDER BY pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE STATISTICS
-- ============================================================================

-- Update table statistics for better query planning
ANALYZE tenant_rent_contracts;
ANALYZE landlord_escrow_balances;
ANALYZE payment_notifications;

-- Set statistics targets for better query planning on key columns
ALTER TABLE tenant_rent_contracts ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE tenant_rent_contracts ALTER COLUMN next_payment_due SET STATISTICS 1000;
ALTER TABLE tenant_rent_contracts ALTER COLUMN landlord_payout_type SET STATISTICS 1000;

ALTER TABLE landlord_escrow_balances ALTER COLUMN is_released SET STATISTICS 1000;
ALTER TABLE landlord_escrow_balances ALTER COLUMN expected_release_date SET STATISTICS 1000;

ALTER TABLE payment_notifications ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE payment_notifications ALTER COLUMN scheduled_for SET STATISTICS 1000;
ALTER TABLE payment_notifications ALTER COLUMN notification_type SET STATISTICS 1000;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_tenant_contracts_active_payment_due IS 'Optimizes scheduler queries for due payments on active contracts';
COMMENT ON INDEX idx_tenant_contracts_yearly_payout IS 'Optimizes queries for yearly payout landlords with active contracts';
COMMENT ON INDEX idx_landlord_escrow_pending_releases IS 'Optimizes scheduler queries for escrow releases';
COMMENT ON INDEX idx_payment_notifications_pending IS 'Optimizes scheduler queries for pending notifications';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Performance indexes migration completed successfully';
    RAISE NOTICE 'Created % indexes for tenant_rent_contracts', (
        SELECT count(*) FROM pg_indexes 
        WHERE tablename = 'tenant_rent_contracts' 
        AND indexname LIKE 'idx_tenant_contracts_%'
    );
    RAISE NOTICE 'Created % indexes for landlord_escrow_balances', (
        SELECT count(*) FROM pg_indexes 
        WHERE tablename = 'landlord_escrow_balances' 
        AND indexname LIKE 'idx_landlord_escrow_%'
    );
    RAISE NOTICE 'Created % indexes for payment_notifications', (
        SELECT count(*) FROM pg_indexes 
        WHERE tablename = 'payment_notifications' 
        AND indexname LIKE 'idx_payment_notifications_%'
    );
END $$;
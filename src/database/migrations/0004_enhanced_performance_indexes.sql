-- Migration: Enhanced performance indexes for tenant rent contracts system
-- Created: 2024-12-16
-- Description: Adds partial indexes, covering indexes, and specialized performance optimizations

-- ============================================================================
-- ENHANCED TENANT RENT CONTRACTS PERFORMANCE INDEXES
-- ============================================================================

-- Partial indexes for specific use cases (more efficient than full table indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_active_only 
ON tenant_rent_contracts (tenant_id, next_payment_due) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_yearly_payout 
ON tenant_rent_contracts (landlord_id, expiry_date) 
WHERE landlord_payout_type = 'yearly' AND status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_existing_tenants 
ON tenant_rent_contracts (transition_start_date, tenant_id) 
WHERE is_existing_tenant = true;

-- Covering indexes for read-heavy operations (include frequently accessed columns)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_covering 
ON tenant_rent_contracts (tenant_id) 
INCLUDE (id, landlord_id, monthly_amount, next_payment_due, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_landlord_covering 
ON tenant_rent_contracts (landlord_id) 
INCLUDE (id, tenant_id, monthly_amount, landlord_payout_type, status);

-- Specialized indexes for scheduler operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_scheduler_due_payments 
ON tenant_rent_contracts (next_payment_due, status, tenant_id) 
WHERE status = 'active' AND next_payment_due <= CURRENT_DATE + INTERVAL '1 day';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_scheduler_expiring 
ON tenant_rent_contracts (expiry_date, landlord_payout_type, landlord_id) 
WHERE status = 'active' AND expiry_date <= CURRENT_DATE + INTERVAL '7 days';

-- ============================================================================
-- ENHANCED LANDLORD ESCROW BALANCES PERFORMANCE INDEXES
-- ============================================================================

-- Partial indexes for escrow operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_unreleased 
ON landlord_escrow_balances (landlord_id, expected_release_date, total_escrowed) 
WHERE is_released = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_ready_for_release 
ON landlord_escrow_balances (landlord_id, contract_id, total_escrowed) 
WHERE is_released = false AND expected_release_date <= CURRENT_DATE;

-- Covering index for escrow balance queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_covering 
ON landlord_escrow_balances (landlord_id) 
INCLUDE (contract_id, total_escrowed, expected_release_date, is_released, months_accumulated);

-- Specialized indexes for scheduler escrow operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_scheduler_releases 
ON landlord_escrow_balances (expected_release_date, is_released, landlord_id) 
WHERE is_released = false AND expected_release_date <= CURRENT_DATE;

-- ============================================================================
-- ENHANCED PAYMENT NOTIFICATIONS PERFORMANCE INDEXES
-- ============================================================================

-- Partial indexes for notification operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_pending_only 
ON payment_notifications (scheduled_for, tenant_id, notification_type) 
WHERE status = 'pending';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_overdue 
ON payment_notifications (tenant_id, created_at, contract_id) 
WHERE notification_type = 'overdue' AND status = 'sent';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_failed 
ON payment_notifications (created_at, tenant_id, notification_type) 
WHERE status = 'failed';

-- Covering index for notification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_covering 
ON payment_notifications (tenant_id) 
INCLUDE (contract_id, notification_type, scheduled_for, status, title);

-- Specialized indexes for scheduler notification operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_scheduler_pending 
ON payment_notifications (scheduled_for, status, tenant_id, contract_id) 
WHERE status = 'pending' AND scheduled_for <= CURRENT_TIMESTAMP;

-- ============================================================================
-- CROSS-TABLE PERFORMANCE INDEXES FOR JOINS
-- ============================================================================

-- Optimized indexes for common JOIN operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_escrow_contract_join_optimized 
ON landlord_escrow_balances (contract_id, is_released) 
INCLUDE (landlord_id, total_escrowed, expected_release_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_contract_join_optimized 
ON payment_notifications (contract_id, status) 
INCLUDE (tenant_id, notification_type, scheduled_for);

-- Index for tenant-contract-notification joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contract_notification_join 
ON tenant_rent_contracts (tenant_id, status) 
INCLUDE (id, next_payment_due, monthly_amount);

-- ============================================================================
-- EXPRESSION INDEXES FOR CALCULATED FIELDS
-- ============================================================================

-- Index for days until payment due (commonly calculated)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_days_until_due 
ON tenant_rent_contracts ((next_payment_due - CURRENT_DATE)) 
WHERE status = 'active';

-- Index for days until expiry (for escrow release calculations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_days_until_expiry 
ON tenant_rent_contracts ((expiry_date - CURRENT_DATE)) 
WHERE status = 'active' AND landlord_payout_type = 'yearly';

-- Index for escrow release readiness (calculated field)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_release_readiness 
ON landlord_escrow_balances ((expected_release_date - CURRENT_DATE)) 
WHERE is_released = false;

-- ============================================================================
-- HASH INDEXES FOR EXACT LOOKUPS
-- ============================================================================

-- Hash indexes for UUID exact lookups (more efficient than B-tree for equality)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_id_hash 
ON tenant_rent_contracts USING hash (id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_landlord_escrow_id_hash 
ON landlord_escrow_balances USING hash (id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_notifications_id_hash 
ON payment_notifications USING hash (id);

-- Hash indexes for foreign key lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_tenant_hash 
ON tenant_rent_contracts USING hash (tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_contracts_landlord_hash 
ON tenant_rent_contracts USING hash (landlord_id);

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to get tenant contract index usage statistics
CREATE OR REPLACE FUNCTION get_tenant_contract_index_usage_detailed()
RETURNS TABLE (
    table_name text,
    index_name text,
    index_size text,
    index_scans bigint,
    tuples_read bigint,
    tuples_fetched bigint,
    usage_ratio numeric,
    last_used timestamp with time zone
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        s.relname::text as table_name,
        i.relname::text as index_name,
        pg_size_pretty(pg_relation_size(i.oid))::text as index_size,
        s.idx_scan as index_scans,
        s.idx_tup_read as tuples_read,
        s.idx_tup_fetch as tuples_fetched,
        CASE 
            WHEN s.idx_scan > 0 THEN round((s.idx_tup_fetch::numeric / s.idx_scan), 2)
            ELSE 0
        END as usage_ratio,
        pg_stat_get_last_autoanalyze_time(s.relid) as last_used
    FROM pg_stat_user_indexes s
    JOIN pg_class i ON s.indexrelid = i.oid
    JOIN pg_class t ON s.relid = t.oid
    WHERE t.relname IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    ORDER BY s.idx_scan DESC, pg_relation_size(i.oid) DESC;
END;
$ LANGUAGE plpgsql;

-- Function to identify duplicate or redundant indexes
CREATE OR REPLACE FUNCTION get_redundant_tenant_contract_indexes()
RETURNS TABLE (
    table_name text,
    redundant_indexes text[],
    recommendation text
) AS $
BEGIN
    RETURN QUERY
    WITH index_columns AS (
        SELECT 
            t.relname as table_name,
            i.relname as index_name,
            array_agg(a.attname ORDER BY a.attnum) as columns
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relname IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
        AND NOT ix.indisunique
        GROUP BY t.relname, i.relname
    ),
    duplicate_groups AS (
        SELECT 
            table_name,
            columns,
            array_agg(index_name) as index_names,
            count(*) as duplicate_count
        FROM index_columns
        GROUP BY table_name, columns
        HAVING count(*) > 1
    )
    SELECT 
        dg.table_name::text,
        dg.index_names,
        ('Consider keeping only one of these indexes: ' || array_to_string(dg.index_names, ', '))::text as recommendation
    FROM duplicate_groups dg;
END;
$ LANGUAGE plpgsql;

-- Function to get query performance recommendations
CREATE OR REPLACE FUNCTION get_tenant_contract_performance_recommendations()
RETURNS TABLE (
    category text,
    recommendation text,
    priority text,
    estimated_impact text
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        'Index Usage'::text as category,
        'Index ' || s.indexname || ' on ' || s.tablename || ' has low usage (' || s.idx_scan || ' scans)'::text as recommendation,
        CASE 
            WHEN s.idx_scan = 0 THEN 'High'
            WHEN s.idx_scan < 10 THEN 'Medium'
            ELSE 'Low'
        END::text as priority,
        CASE 
            WHEN s.idx_scan = 0 THEN 'Remove unused index to improve write performance'
            ELSE 'Consider if this index is necessary'
        END::text as estimated_impact
    FROM pg_stat_user_indexes s
    WHERE s.tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    AND s.idx_scan < 100
    AND s.indexname NOT LIKE '%_pkey'
    
    UNION ALL
    
    SELECT 
        'Table Maintenance'::text as category,
        'Table ' || schemaname || '.' || tablename || ' needs VACUUM (dead tuples: ' || n_dead_tup || ')'::text as recommendation,
        CASE 
            WHEN n_dead_tup > 10000 THEN 'High'
            WHEN n_dead_tup > 1000 THEN 'Medium'
            ELSE 'Low'
        END::text as priority,
        'Improve query performance and reclaim storage space'::text as estimated_impact
    FROM pg_stat_user_tables
    WHERE tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    AND n_dead_tup > 100;
END;
$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE STATISTICS AND MONITORING
-- ============================================================================

-- Update statistics for better query planning
ANALYZE tenant_rent_contracts;
ANALYZE landlord_escrow_balances;
ANALYZE payment_notifications;

-- Set enhanced statistics targets for critical columns
ALTER TABLE tenant_rent_contracts ALTER COLUMN status SET STATISTICS 2000;
ALTER TABLE tenant_rent_contracts ALTER COLUMN next_payment_due SET STATISTICS 2000;
ALTER TABLE tenant_rent_contracts ALTER COLUMN landlord_payout_type SET STATISTICS 1500;
ALTER TABLE tenant_rent_contracts ALTER COLUMN expiry_date SET STATISTICS 1500;

ALTER TABLE landlord_escrow_balances ALTER COLUMN is_released SET STATISTICS 1500;
ALTER TABLE landlord_escrow_balances ALTER COLUMN expected_release_date SET STATISTICS 2000;
ALTER TABLE landlord_escrow_balances ALTER COLUMN total_escrowed SET STATISTICS 1000;

ALTER TABLE payment_notifications ALTER COLUMN status SET STATISTICS 1500;
ALTER TABLE payment_notifications ALTER COLUMN scheduled_for SET STATISTICS 2000;
ALTER TABLE payment_notifications ALTER COLUMN notification_type SET STATISTICS 1000;

-- ============================================================================
-- INDEX MAINTENANCE AUTOMATION
-- ============================================================================

-- Create a function to automatically maintain indexes
CREATE OR REPLACE FUNCTION maintain_tenant_contract_indexes()
RETURNS TABLE (
    action text,
    target text,
    result text,
    execution_time interval
) AS $
DECLARE
    start_time timestamp;
    end_time timestamp;
BEGIN
    -- Reindex if fragmentation is high
    start_time := clock_timestamp();
    
    -- Check and reindex fragmented indexes
    FOR target IN 
        SELECT indexname 
        FROM pg_stat_user_indexes 
        WHERE tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
        AND idx_scan > 1000  -- Only reindex frequently used indexes
    LOOP
        BEGIN
            EXECUTE 'REINDEX INDEX CONCURRENTLY ' || target;
            end_time := clock_timestamp();
            
            RETURN QUERY SELECT 
                'REINDEX'::text,
                target::text,
                'SUCCESS'::text,
                (end_time - start_time)::interval;
                
        EXCEPTION WHEN OTHERS THEN
            end_time := clock_timestamp();
            
            RETURN QUERY SELECT 
                'REINDEX'::text,
                target::text,
                ('ERROR: ' || SQLERRM)::text,
                (end_time - start_time)::interval;
        END;
        
        start_time := clock_timestamp();
    END LOOP;
    
    -- Update statistics
    start_time := clock_timestamp();
    ANALYZE tenant_rent_contracts;
    ANALYZE landlord_escrow_balances;
    ANALYZE payment_notifications;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'ANALYZE'::text,
        'All tenant contract tables'::text,
        'SUCCESS'::text,
        (end_time - start_time)::interval;
END;
$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_tenant_contracts_active_only IS 'Partial index for active contracts only - optimizes scheduler queries';
COMMENT ON INDEX idx_tenant_contracts_yearly_payout IS 'Partial index for yearly payout active contracts - optimizes escrow queries';
COMMENT ON INDEX idx_tenant_contracts_covering IS 'Covering index for tenant contract lookups - includes frequently accessed columns';
COMMENT ON INDEX idx_landlord_escrow_unreleased IS 'Partial index for unreleased escrow balances - optimizes payout queries';
COMMENT ON INDEX idx_payment_notifications_pending_only IS 'Partial index for pending notifications - optimizes scheduler notification queries';

COMMENT ON FUNCTION get_tenant_contract_index_usage_detailed() IS 'Provides detailed index usage statistics for tenant contract tables';
COMMENT ON FUNCTION get_redundant_tenant_contract_indexes() IS 'Identifies potentially redundant indexes that could be removed';
COMMENT ON FUNCTION get_tenant_contract_performance_recommendations() IS 'Generates performance recommendations based on usage patterns';
COMMENT ON FUNCTION maintain_tenant_contract_indexes() IS 'Automated index maintenance function for tenant contract system';

-- Log completion with detailed statistics
DO $
DECLARE
    total_indexes integer;
    partial_indexes integer;
    covering_indexes integer;
    hash_indexes integer;
BEGIN
    SELECT count(*) INTO total_indexes
    FROM pg_indexes 
    WHERE tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications');
    
    SELECT count(*) INTO partial_indexes
    FROM pg_indexes 
    WHERE tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    AND indexdef LIKE '%WHERE%';
    
    SELECT count(*) INTO covering_indexes
    FROM pg_indexes 
    WHERE tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    AND indexdef LIKE '%INCLUDE%';
    
    SELECT count(*) INTO hash_indexes
    FROM pg_indexes 
    WHERE tablename IN ('tenant_rent_contracts', 'landlord_escrow_balances', 'payment_notifications')
    AND indexdef LIKE '%USING hash%';
    
    RAISE NOTICE 'Enhanced performance indexes migration completed successfully';
    RAISE NOTICE 'Total indexes: %, Partial indexes: %, Covering indexes: %, Hash indexes: %', 
        total_indexes, partial_indexes, covering_indexes, hash_indexes;
    RAISE NOTICE 'Performance monitoring functions created: 4';
    RAISE NOTICE 'Automated maintenance functions created: 1';
END $;
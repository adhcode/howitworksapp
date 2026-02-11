# Database Migration Quick Reference

## TL;DR - Production Migration

```bash
# 1. Test on Neon
psql "$NEON_DB" -f migrations/your_migration.sql

# 2. Run on Production (with safety checks)
cd backend
chmod +x migrate-to-production.sh
./migrate-to-production.sh migrations/your_migration.sql

# 3. Deploy code
git push
```

## Database URLs

```bash
# Development (Neon)
export NEON_DB="postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Production (Railway)
export PROD_DB="postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway"
```

## Common Commands

### Connect to Database
```bash
# Neon (Dev)
psql "$NEON_DB"

# Railway (Prod)
psql "$PROD_DB"
```

### Run Migration
```bash
# On Neon
psql "$NEON_DB" -f migrations/your_migration.sql

# On Production (safe way)
./backend/migrate-to-production.sh migrations/your_migration.sql
```

### Backup & Restore
```bash
# Backup
pg_dump "$PROD_DB" > backup.sql

# Restore
psql "$PROD_DB" < backup.sql
```

### Useful SQL Commands
```sql
-- List tables
\dt

-- Describe table
\d table_name

-- List indexes
\di

-- List columns
\d+ table_name

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('table_name'));

-- Exit
\q
```

## Migration Template

```sql
-- migrations/add_feature_name.sql
-- Description: What this migration does

-- Add column (safe)
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;

-- Create index (safe, non-blocking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_name 
ON table_name(column_name);

-- Verify
SELECT column_name FROM table_name LIMIT 1;
```

## Safety Checklist

Before production migration:
- [ ] Tested on Neon ✓
- [ ] Backup created ✓
- [ ] Migration is reversible ✓
- [ ] Low-traffic time ✓
- [ ] Rollback plan ready ✓

## Rollback Template

```sql
-- migrations/rollback_feature_name.sql
-- Rollback for: add_feature_name.sql

-- Drop index
DROP INDEX IF EXISTS idx_name;

-- Drop column (careful with data!)
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
```

## Emergency Rollback

```bash
# If migration fails, restore from backup
psql "$PROD_DB" < backup_YYYYMMDD_HHMMSS.sql

# Or run rollback migration
psql "$PROD_DB" -f migrations/rollback_feature_name.sql
```

## Workflow Summary

```
┌─────────────────────────────────────────────────────────┐
│ 1. CREATE MIGRATION                                     │
│    └─ migrations/add_feature.sql                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. TEST ON NEON (Development)                           │
│    └─ psql $NEON_DB -f migrations/add_feature.sql      │
│    └─ npm run start:dev                                 │
│    └─ Test application                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. BACKUP PRODUCTION                                    │
│    └─ pg_dump $PROD_DB > backup.sql                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. RUN ON PRODUCTION                                    │
│    └─ ./migrate-to-production.sh migrations/add_*.sql  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. DEPLOY CODE                                          │
│    └─ git add .                                         │
│    └─ git commit -m "feat: Add feature"                │
│    └─ git push                                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 6. VERIFY                                               │
│    └─ Check Railway logs                               │
│    └─ Test production endpoints                        │
└─────────────────────────────────────────────────────────┘
```

## Files Reference

- `backend/run-all-migrations-neon.sh` - Run all migrations on Neon
- `backend/migrate-to-production.sh` - Safe production migration
- `backend/migrations/*.sql` - Migration files
- `PRODUCTION_MIGRATION_GUIDE.md` - Detailed guide
- `NEON_DEV_DATABASE_SETUP.md` - Development setup

## Pro Tips

1. **Always use IF EXISTS / IF NOT EXISTS** for idempotent migrations
2. **Create indexes CONCURRENTLY** to avoid locking tables
3. **Test rollback** before running on production
4. **Monitor Railway logs** after deployment
5. **Keep backups** for at least 30 days
6. **Document migrations** with clear comments
7. **Run during low-traffic hours** when possible

## Example: Adding a New Feature

```bash
# 1. Create migration
cat > backend/migrations/add_user_preferences.sql << 'EOF'
-- Add user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);
EOF

# 2. Test on Neon
psql "$NEON_DB" -f backend/migrations/add_user_preferences.sql

# 3. Test application
cd backend && npm run start:dev

# 4. Run on production
./backend/migrate-to-production.sh migrations/add_user_preferences.sql

# 5. Deploy
git add .
git commit -m "feat: Add user preferences"
git push
```

Done! ✅

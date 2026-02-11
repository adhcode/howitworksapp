# Production Database Migration Guide

## Safe Migration Workflow

When you need to add changes to the production database, follow this workflow:

## Step 1: Develop & Test on Neon (Development)

### 1.1 Create Migration File
```bash
cd backend/migrations
# Create your migration file
touch add_new_feature.sql
```

Example migration:
```sql
-- migrations/add_new_feature.sql
-- Add new column to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);

-- Create index if needed
CREATE INDEX IF NOT EXISTS idx_users_new_field ON users(new_field);
```

### 1.2 Test on Neon First
```bash
# Connect to Neon
psql 'postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# Run migration
\i migrations/add_new_feature.sql

# Verify changes
\d users
```

### 1.3 Update Migration Script
Add your migration to `run-all-migrations-neon.sh`:
```bash
# Add this line
run_migration "migrations/add_new_feature.sql" "Add new feature column"
```

### 1.4 Test Application
```bash
cd backend
npm run start:dev
# Test all features that use the new changes
```

## Step 2: Backup Production Database

**CRITICAL: Always backup before production changes!**

### Option A: Railway Dashboard Backup
1. Go to Railway dashboard
2. Select your database service
3. Go to "Backups" tab
4. Click "Create Backup"
5. Wait for completion

### Option B: Manual Backup
```bash
# Backup production database
pg_dump 'postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway' > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file exists
ls -lh backup_*.sql
```

## Step 3: Deploy to Production

### Method 1: Direct Migration (Recommended for Small Changes)

```bash
# Connect to Railway production database
psql 'postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway'

# Run migration
\i migrations/add_new_feature.sql

# Verify changes
\d table_name

# Exit
\q
```

### Method 2: Using Script (For Multiple Migrations)

Create `backend/run-production-migration.sh`:
```bash
#!/bin/bash

PROD_DB="postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway"

echo "⚠️  WARNING: Running migration on PRODUCTION database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "Running migration: $1"
psql "$PROD_DB" -f "$1"
echo "✅ Migration complete"
```

Usage:
```bash
chmod +x backend/run-production-migration.sh
./backend/run-production-migration.sh migrations/add_new_feature.sql
```

## Step 4: Deploy Code Changes

After database migration is successful:

```bash
# Commit changes
git add .
git commit -m "feat: Add new feature with database migration"

# Push to trigger Railway deployment
git push origin main
```

Railway will automatically:
1. Pull latest code
2. Build application
3. Deploy with new code that uses the migrated database

## Step 5: Verify Production

```bash
# Check Railway logs
# Go to Railway dashboard → Your service → Deployments → View logs

# Test production endpoints
curl https://propertyhomecare-production.up.railway.app/health

# Test new feature
curl https://propertyhomecare-production.up.railway.app/your-new-endpoint
```

## Complete Example Workflow

Let's say you want to add a `phone_verified` column to users:

### 1. Create Migration
```sql
-- migrations/add_phone_verification.sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_phone_verified 
ON users(phone_verified);
```

### 2. Test on Neon
```bash
# Run on Neon
psql "$NEON_DB" -f migrations/add_phone_verification.sql

# Test locally
npm run start:dev
```

### 3. Backup Production
```bash
pg_dump "$PROD_DB" > backup_before_phone_verification.sql
```

### 4. Run on Production
```bash
psql "$PROD_DB" -f migrations/add_phone_verification.sql
```

### 5. Deploy Code
```bash
git add migrations/add_phone_verification.sql
git add backend/src/users/users.service.ts  # Your code changes
git commit -m "feat: Add phone verification"
git push
```

## Rollback Strategy

If something goes wrong:

### Option 1: Restore from Backup
```bash
# Restore from backup
psql "$PROD_DB" < backup_before_phone_verification.sql
```

### Option 2: Reverse Migration
Create a rollback migration:
```sql
-- migrations/rollback_phone_verification.sql
ALTER TABLE users DROP COLUMN IF EXISTS phone_verified;
DROP INDEX IF EXISTS idx_users_phone_verified;
```

Run it:
```bash
psql "$PROD_DB" -f migrations/rollback_phone_verification.sql
```

## Best Practices

### ✅ DO:
- Always test on Neon first
- Always backup before production changes
- Use `IF NOT EXISTS` / `IF EXISTS` for safety
- Run migrations during low-traffic hours
- Monitor logs after deployment
- Test thoroughly on development
- Document all migrations

### ❌ DON'T:
- Never run untested migrations on production
- Don't skip backups
- Don't make breaking changes without planning
- Don't delete columns with data immediately
- Don't run migrations during peak hours

## Migration Checklist

Before running on production:

- [ ] Migration tested on Neon
- [ ] Application tested with migration
- [ ] Production backup created
- [ ] Migration is reversible
- [ ] Team notified (if applicable)
- [ ] Low-traffic time scheduled
- [ ] Rollback plan ready
- [ ] Monitoring in place

## Common Migration Patterns

### Adding a Column
```sql
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;
```

### Adding an Index
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_name 
ON table_name(column_name);
```

### Modifying a Column (Safe)
```sql
-- Add new column
ALTER TABLE users ADD COLUMN new_email VARCHAR(255);

-- Copy data
UPDATE users SET new_email = email;

-- Later, after verification, drop old column
-- ALTER TABLE users DROP COLUMN email;
-- ALTER TABLE users RENAME COLUMN new_email TO email;
```

### Creating a Table
```sql
CREATE TABLE IF NOT EXISTS new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Quick Reference Commands

```bash
# Connect to Neon (Dev)
psql 'postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# Connect to Railway (Prod)
psql 'postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway'

# Backup production
pg_dump "$PROD_DB" > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration on production
psql "$PROD_DB" -f migrations/your_migration.sql

# List tables
\dt

# Describe table
\d table_name

# Check indexes
\di

# Exit
\q
```

## Emergency Contacts

If something goes wrong:
1. Check Railway logs immediately
2. Restore from backup if needed
3. Roll back deployment in Railway dashboard
4. Run rollback migration if available

## Summary

The safe workflow is:
1. **Develop** on Neon → Test thoroughly
2. **Backup** production → Safety first
3. **Migrate** production database → Run SQL
4. **Deploy** code → Push to Railway
5. **Verify** → Check logs and test

Never skip steps 1 and 2!

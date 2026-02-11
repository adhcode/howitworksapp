# Neon Development Database Setup

## Overview

- **Development**: Neon Database (fast, serverless PostgreSQL)
- **Production**: Railway Database (existing production data)

## Database URLs

### Development (Neon)
```
postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Production (Railway)
```
postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway
```

## Setup Steps

### 1. Update Local Environment

Your `backend/.env` is now configured to use Neon for development:

```env
DATABASE_URL="postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

### 2. Run All Migrations

```bash
cd backend
chmod +x run-all-migrations-neon.sh
./run-all-migrations-neon.sh
```

This will run:
- Password reset code migration
- Notifications tables
- Notifications schema fixes
- Payment indexes
- Artisans directory table

### 3. Verify Database

```bash
# Connect to Neon database
psql 'postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# List all tables
\dt

# Check specific tables
\d users
\d properties
\d notifications
\d artisans
```

### 4. Start Development Server

```bash
cd backend
npm run start:dev
```

The backend will now connect to Neon database for development.

## Railway Production Setup

### Important: Keep Railway Using Production Database

In Railway dashboard, ensure the `DATABASE_URL` environment variable is set to:

```
postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway
```

**Do NOT change this** - it contains your production data.

## Benefits of This Setup

### Neon (Development)
- ✅ Fast serverless PostgreSQL
- ✅ Automatic backups
- ✅ Branch databases for testing
- ✅ Free tier available
- ✅ No impact on production data

### Railway (Production)
- ✅ Existing production data preserved
- ✅ Proven stability
- ✅ Current user data intact
- ✅ No migration needed

## Development Workflow

1. **Local Development**: Use Neon database
   ```bash
   npm run start:dev
   ```

2. **Test Changes**: All changes go to Neon first
   ```bash
   # Run migrations
   ./run-all-migrations-neon.sh
   
   # Test features
   npm run start:dev
   ```

3. **Deploy to Production**: Push to Railway
   ```bash
   git push
   ```
   Railway automatically deploys with production database

## Migration Workflow

### Adding New Migrations

1. Create migration file in `backend/migrations/`
2. Test on Neon first:
   ```bash
   psql "$NEON_DB" -f migrations/your_new_migration.sql
   ```
3. Add to `run-all-migrations-neon.sh`
4. When ready for production, run on Railway database

### Running Migrations on Production

```bash
# Connect to Railway database
psql 'postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway'

# Run migration
\i migrations/your_migration.sql
```

## Troubleshooting

### Connection Issues

If you can't connect to Neon:
```bash
# Test connection
psql 'postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' -c "SELECT version();"
```

### Migration Errors

If a migration fails:
```bash
# Check what tables exist
psql "$NEON_DB" -c "\dt"

# Check specific table structure
psql "$NEON_DB" -c "\d table_name"

# Manually fix and re-run
```

### Reset Neon Database

If you need to start fresh:
```bash
# Drop all tables (careful!)
psql "$NEON_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run all migrations
./run-all-migrations-neon.sh
```

## Quick Commands

```bash
# Connect to Neon
psql 'postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# Connect to Railway (production)
psql 'postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway'

# Run all migrations on Neon
cd backend && ./run-all-migrations-neon.sh

# Start dev server with Neon
cd backend && npm run start:dev
```

## Environment Variables Summary

### Local Development (.env)
```env
DATABASE_URL="postgresql://neondb_owner:npg_k6XMr0gTlDVn@ep-silent-mountain-abf0q4hy-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
NODE_ENV="development"
```

### Railway Production (Railway Dashboard)
```env
DATABASE_URL="postgresql://postgres:IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH@yamanote.proxy.rlwy.net:34012/railway"
NODE_ENV="production"
ADMIN_DASHBOARD_URL="https://app.howitworks.com.ng"
```

## Next Steps

1. Run migrations: `./run-all-migrations-neon.sh`
2. Start dev server: `npm run start:dev`
3. Test all features locally
4. Push to production when ready

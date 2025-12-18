# Neon Database Setup Guide

## Quick Setup (Recommended)

Your Neon database URL is already configured in `.env`. Now let's sync all tables and migrations.

### Option 1: Using Drizzle Push (Fastest)

This will automatically create/update all tables based on your schema:

```bash
cd backend
npx drizzle-kit push
```

This command will:
- Connect to your Neon database
- Compare your schema files with the database
- Create any missing tables
- Add any missing columns
- Show you a preview before applying changes

### Option 2: Using Custom Sync Script

```bash
cd backend
npm run sync-neon
```

Or manually:

```bash
cd backend
npx ts-node sync-neon-database.ts
```

---

## Step-by-Step Manual Setup

If you prefer to do it step by step:

### Step 1: Push Schema to Neon

```bash
cd backend
npx drizzle-kit push
```

This creates all tables from your schema files:
- users
- properties
- units
- leases
- payments
- payment_history
- messages
- maintenance_requests
- tenant_invitations
- tenant_rent_contracts
- landlord_escrow_balances
- payment_notifications
- landlord_wallet_balances
- wallet_transactions
- notifications
- push_tokens

### Step 2: Apply Custom Migrations

The `drizzle-kit push` command should handle most of the schema, but if you need to apply the custom SQL migrations manually:

#### Using Node.js (Cross-platform)

```bash
cd backend
npx ts-node -e "
import postgres from 'postgres';
import * as fs from 'fs';
import { config } from 'dotenv';

config();
const sql = postgres(process.env.DATABASE_URL);

(async () => {
  // Password reset migration
  const sql1 = fs.readFileSync('migrations/add_password_reset_code.sql', 'utf-8');
  await sql.unsafe(sql1);
  console.log('✓ Password reset fields added');
  
  // Paystack migration
  const sql2 = fs.readFileSync('migrations/add-paystack-fields.sql', 'utf-8');
  await sql.unsafe(sql2);
  console.log('✓ Paystack fields added');
  
  await sql.end();
})();
"
```

#### Using psql (If you have PostgreSQL client)

```bash
cd backend

# Apply password reset migration
psql "$DATABASE_URL" -f migrations/add_password_reset_code.sql

# Apply Paystack migration
psql "$DATABASE_URL" -f migrations/add-paystack-fields.sql
```

---

## Verify Database Setup

### Check Tables Exist

```bash
cd backend
npx drizzle-kit studio
```

This opens Drizzle Studio in your browser where you can:
- View all tables
- See table structures
- Browse data
- Run queries

Or check via code:

```bash
cd backend
npx ts-node -e "
import postgres from 'postgres';
import { config } from 'dotenv';

config();
const sql = postgres(process.env.DATABASE_URL);

(async () => {
  const tables = await sql\`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  \`;
  
  console.log('📊 Tables in database:');
  tables.forEach(t => console.log('  ✓', t.table_name));
  
  await sql.end();
})();
"
```

---

## What Gets Created

### Core Tables
- **users** - All user accounts (landlords, tenants, admins, facilitators)
- **properties** - Property listings
- **units** - Individual units within properties
- **leases** - Lease agreements

### Payment System
- **payments** - Rent payments and transactions
- **payment_history** - Audit trail for payment changes
- **tenant_rent_contracts** - Recurring payment contracts
- **landlord_wallet_balances** - Landlord wallet balances
- **wallet_transactions** - Wallet transaction history
- **landlord_escrow_balances** - Escrow for yearly payouts
- **payment_notifications** - Scheduled payment reminders

### Communication
- **messages** - Direct messages between users
- **maintenance_requests** - Maintenance/repair requests
- **notifications** - In-app notifications
- **push_tokens** - Push notification device tokens

### Tenant Management
- **tenant_invitations** - Tenant invitation system

---

## Troubleshooting

### Issue: "relation already exists"

This means some tables already exist. That's fine! The migrations use `IF NOT EXISTS` clauses, so they won't break existing tables.

### Issue: "column already exists"

Same as above - the migrations use `ADD COLUMN IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: Connection timeout

Check your Neon database:
1. Go to Neon console
2. Verify the database is active (not suspended)
3. Check the connection string is correct
4. Ensure your IP is allowed (Neon usually allows all IPs)

### Issue: SSL/TLS errors

Your connection string already includes `sslmode=require`, which is correct for Neon.

---

## Quick Test

After setup, test the connection:

```bash
cd backend
npm run start:dev
```

Then check the logs - you should see:
```
✓ Database connected successfully
```

---

## Next Steps

1. ✅ Run `npx drizzle-kit push` to sync schema
2. ✅ Verify tables with `npx drizzle-kit studio`
3. ✅ Start your backend with `npm run start:dev`
4. ✅ Test API endpoints

---

## Useful Commands

```bash
# Push schema changes to database
npx drizzle-kit push

# Open database studio
npx drizzle-kit studio

# Generate migration files (if needed)
npx drizzle-kit generate

# Check database connection
npx ts-node -e "import postgres from 'postgres'; import { config } from 'dotenv'; config(); const sql = postgres(process.env.DATABASE_URL); sql\`SELECT NOW()\`.then(r => { console.log('✓ Connected:', r[0].now); sql.end(); });"
```

---

## Important Notes

- ✅ Your Neon database URL is already configured
- ✅ All schema files are up to date
- ✅ Migrations are idempotent (safe to run multiple times)
- ✅ No data will be lost - only new tables/columns added
- ⚠️  Neon free tier may suspend after inactivity - just wake it up by connecting

---

## Need Help?

If you encounter issues:
1. Check Neon console for database status
2. Verify DATABASE_URL in .env
3. Ensure backend dependencies are installed: `npm install`
4. Check backend logs for specific errors

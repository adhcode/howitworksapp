import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env file');
  process.exit(1);
}

async function syncDatabase() {
  console.log('🚀 Starting Neon Database Sync...\n');

  // Create postgres connection
  const sql = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    // Step 1: Apply custom SQL migrations
    console.log('📝 Step 1: Applying custom SQL migrations...');
    
    // Read and execute password reset migration
    const passwordResetSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_password_reset_code.sql'),
      'utf-8'
    );
    console.log('  → Applying password reset code migration...');
    await sql.unsafe(passwordResetSQL);
    console.log('  ✓ Password reset fields added');

    // Read and execute Paystack migration
    const paystackSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-paystack-fields.sql'),
      'utf-8'
    );
    console.log('  → Applying Paystack fields migration...');
    await sql.unsafe(paystackSQL);
    console.log('  ✓ Paystack fields added\n');

    // Step 2: Verify critical tables exist
    console.log('🔍 Step 2: Verifying database tables...');
    
    const tables = [
      'users',
      'properties',
      'units',
      'payments',
      'payment_history',
      'notifications',
      'push_tokens',
      'leases',
      'messages',
      'maintenance_requests',
      'tenant_invitations',
      'tenant_rent_contracts',
      'landlord_escrow_balances',
      'payment_notifications',
      'landlord_wallet_balances',
      'wallet_transactions',
    ];

    for (const table of tables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        );
      `;
      
      if (result[0].exists) {
        console.log(`  ✓ ${table}`);
      } else {
        console.log(`  ⚠️  ${table} - NOT FOUND`);
      }
    }

    console.log('\n✅ Database sync complete!');
    console.log('🎉 Your Neon database is ready.\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the sync
syncDatabase();

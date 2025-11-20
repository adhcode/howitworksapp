import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function runMigration() {
  try {
    console.log('📝 Creating wallet system tables...');
    
    const migrationSQL = fs.readFileSync(
      './src/database/migrations/0009_create_wallet_system.sql',
      'utf-8'
    );
    
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Wallet system migration completed successfully!');
    
    // Verify tables were created
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('landlord_wallet_balances', 'wallet_transactions');
    `;
    
    console.log('\n📊 Created tables:', result.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();

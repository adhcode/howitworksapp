import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function runMigration() {
  try {
    console.log('📝 Making tenant_invitation_id nullable...');
    
    await sql`
      ALTER TABLE payments 
      ALTER COLUMN tenant_invitation_id DROP NOT NULL;
    `;
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the change
    const result = await sql`
      SELECT 
        column_name, 
        is_nullable,
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      AND column_name = 'tenant_invitation_id';
    `;
    
    console.log('\n📊 Column info:', result[0]);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();

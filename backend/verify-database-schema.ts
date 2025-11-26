import postgres from 'postgres';
import { config } from 'dotenv';

config();

async function verifySchema() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    console.log('\n📊 Checking required tables...\n');
    
    const requiredTables = [
      'users',
      'properties',
      'units',
      'tenant_invitations',
      'payments',
      'maintenance_requests',
      'tenant_rent_contracts',
      'landlord_escrow_balances',
    ];
    
    for (const tableName of requiredTables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `;
      
      const exists = result[0].exists;
      console.log(`${exists ? '✅' : '❌'} ${tableName}`);
      
      if (exists) {
        // Show column count
        const columns = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position
        `;
        console.log(`   └─ ${columns.length} columns`);
      }
    }
    
    console.log('\n📋 Checking properties table structure...\n');
    const propertiesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'properties'
      ORDER BY ordinal_position
    `;
    
    propertiesColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    console.log('\n✅ Schema verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifySchema();

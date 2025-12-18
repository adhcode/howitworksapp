import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env file');
  process.exit(1);
}

async function verifyConnection() {
  console.log('🔍 Verifying Railway Database Connection...\n');

  const sql = postgres(DATABASE_URL, { max: 1 });

  try {
    // Test connection
    console.log('📡 Testing connection...');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connection successful!');
    console.log(`   Time: ${result[0].current_time}`);
    console.log(`   PostgreSQL: ${result[0].pg_version.split(' ')[1]}\n`);

    // Check database name
    const dbInfo = await sql`SELECT current_database() as db_name`;
    console.log(`📊 Database: ${dbInfo[0].db_name}`);

    // List all tables
    console.log('\n📋 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    if (tables.length === 0) {
      console.log('⚠️  No tables found! You may need to run migrations.');
    } else {
      console.log(`✅ Found ${tables.length} tables:\n`);
      tables.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.table_name}`);
      });
    }

    // Check for critical tables
    console.log('\n🔍 Verifying critical tables...');
    const criticalTables = [
      'users',
      'properties',
      'units',
      'payments',
      'maintenance_requests',
      'notifications',
      'facilitators' // This might not exist as separate table
    ];

    const existingTables = tables.map(t => t.table_name);
    
    criticalTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ⚠️  ${table} - NOT FOUND`);
      }
    });

    // Check users table for recent columns
    console.log('\n🔍 Checking users table schema...');
    try {
      const userColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN (
          'password_reset_code',
          'password_reset_code_expires',
          'paystack_authorization_code',
          'paystack_recipient_code'
        )
        ORDER BY column_name;
      `;

      if (userColumns.length > 0) {
        console.log('   Recent columns found:');
        userColumns.forEach(col => {
          console.log(`   ✅ ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('   ⚠️  Recent columns not found. May need to run migrations.');
      }
    } catch (error) {
      console.log('   ⚠️  Could not check users table schema');
    }

    // Count records in key tables
    console.log('\n📊 Record counts:');
    try {
      const counts = await sql`
        SELECT 
          (SELECT COUNT(*) FROM users) as users,
          (SELECT COUNT(*) FROM properties) as properties,
          (SELECT COUNT(*) FROM payments) as payments,
          (SELECT COUNT(*) FROM maintenance_requests) as maintenance_requests;
      `;
      
      console.log(`   Users: ${counts[0].users}`);
      console.log(`   Properties: ${counts[0].properties}`);
      console.log(`   Payments: ${counts[0].payments}`);
      console.log(`   Maintenance Requests: ${counts[0].maintenance_requests}`);
    } catch (error) {
      console.log('   ⚠️  Could not count records (tables may not exist)');
    }

    console.log('\n✅ Verification complete!');
    console.log('\n📝 Summary:');
    console.log('   - Connection: ✅ Working');
    console.log('   - Database: Railway Production');
    console.log(`   - Tables: ${tables.length} found`);
    
    if (tables.length === 0) {
      console.log('\n⚠️  Action Required:');
      console.log('   Run: npx drizzle-kit push');
      console.log('   This will create all necessary tables.');
    }

  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check DATABASE_URL in .env');
    console.log('   2. Verify Railway database is running');
    console.log('   3. Check network connection');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run verification
verifyConnection();

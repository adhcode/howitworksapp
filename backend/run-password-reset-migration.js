const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runMigration() {
  console.log('📋 Database URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('💡 Make sure backend/.env file exists and contains DATABASE_URL');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('🔄 Running password reset code migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_password_reset_code.sql'),
      'utf8'
    );

    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the columns were added
    console.log('🔍 Verifying new columns...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='users' 
      AND column_name IN ('password_reset_code', 'password_reset_code_expires')
      ORDER BY column_name;
    `);
    
    if (result.rows.length === 2) {
      console.log('✅ Columns verified:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('⚠️  Warning: Expected 2 columns, found', result.rows.length);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Database connection closed');
  }
}

runMigration();

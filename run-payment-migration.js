/**
 * Run Payment Migration
 * Makes tenant_invitation_id nullable in payments table
 */

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('🔄 Running Payment Migration');
  console.log('============================');
  console.log('');

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  // Read migration file
  const migrationPath = path.join(__dirname, 'src/database/migrations/0008_make_tenant_invitation_id_nullable.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📝 Migration SQL:');
  console.log(migrationSQL);
  console.log('');
  console.log('============================');
  console.log('');

  try {
    // Create postgres client
    const sql = postgres(process.env.DATABASE_URL);

    console.log('🔌 Connecting to database...');
    
    // Execute migration (split by semicolon for multiple statements)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    // Close connection
    await sql.end();

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Changes applied:');
    console.log('  - tenant_invitation_id is now nullable in payments table');
    console.log('  - Payment records can be created without tenant invitation reference');
    console.log('');
    console.log('============================');
    
  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('already exists') || error.message.includes('does not exist')) {
      console.log('💡 Tip: This might mean the migration was already applied or the table structure is different.');
      console.log('   Check your database schema in Neon Console.');
    }
    
    process.exit(1);
  }
}

// Run migration
runMigration().catch(console.error);

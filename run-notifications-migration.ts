import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Running notifications migration...');
  
  try {
    // Create connection - TypeScript knows connectionString is defined here
    const client = postgres(connectionString as string);
    const db = drizzle(client);
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'src/database/migrations/0010_create_notifications.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await client.unsafe(migrationSQL);
    
    console.log('✅ Notifications migration completed successfully!');
    console.log('');
    console.log('📋 Tables created:');
    console.log('  - push_tokens');
    console.log('  - notification_preferences');
    console.log('  - notification_history');
    console.log('');
    console.log('🔍 Indexes created:');
    console.log('  - idx_push_tokens_user_id');
    console.log('  - idx_push_tokens_expo_token');
    console.log('  - idx_push_tokens_active');
    console.log('  - idx_notification_preferences_user_id');
    console.log('  - idx_notification_history_user_id');
    console.log('  - idx_notification_history_read');
    console.log('  - idx_notification_history_sent_at');
    
    await client.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

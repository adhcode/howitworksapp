import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { notifications } from './src/database/schema/notifications';
import { eq, desc } from 'drizzle-orm';

config();

async function testNotificationsEndpoint() {
  console.log('🔍 Testing notifications endpoint logic...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    // Test 1: Check if notifications table exists
    console.log('1️⃣ Checking if notifications table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      );
    `);
    console.log('✅ Table exists:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Notifications table does not exist!');
      process.exit(1);
    }

    // Test 2: Check table structure
    console.log('\n2️⃣ Checking table structure...');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `);
    console.log('Columns:', columns.rows);

    // Test 3: Try to query notifications (simulate the endpoint)
    console.log('\n3️⃣ Testing query with a sample user ID...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, testUserId))
        .orderBy(desc(notifications.sentAt))
        .limit(50)
        .offset(0);
      
      console.log('✅ Query successful! Found', result.length, 'notifications');
    } catch (queryError: any) {
      console.log('❌ Query failed:', queryError.message);
      console.log('Stack:', queryError.stack);
    }

    // Test 4: Check if there are any notifications in the table
    console.log('\n4️⃣ Checking total notifications count...');
    const countResult = await pool.query('SELECT COUNT(*) FROM notifications');
    console.log('Total notifications in DB:', countResult.rows[0].count);

    // Test 5: Sample a few notifications
    console.log('\n5️⃣ Sampling notifications...');
    const sample = await pool.query('SELECT * FROM notifications LIMIT 3');
    console.log('Sample notifications:', JSON.stringify(sample.rows, null, 2));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testNotificationsEndpoint();

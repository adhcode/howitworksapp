import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { users } from './src/database/schema/users';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // Admin user details
    const adminEmail = 'admin@howitworks.app';
    const adminPassword = 'Admin@123'; // Change this to a secure password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', adminEmail);
      console.log('You can use this account to login.');
      return;
    }

    // Create admin user
    const [newAdmin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phoneNumber: '+1234567890',
        isActive: true,
        emailVerified: true,
      })
      .returning();

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('');
    console.log('You can now login to the admin dashboard at:');
    console.log('http://localhost:3001');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Import eq from drizzle-orm
import { eq } from 'drizzle-orm';

createAdminUser();

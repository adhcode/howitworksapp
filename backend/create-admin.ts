import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { users } from './src/database/schema/users';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    const email = 'admin1@hiw.app';
    const password = 'howitworks1238';
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+2348000000000',
      role: 'admin',
      isActive: true,
      isEmailVerified: true, // Auto-verify admin
    }).returning();

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', newAdmin[0].id);

    await pool.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('⚠️  Admin user already exists with this email');
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
    await pool.end();
    process.exit(1);
  }
}

createAdmin();

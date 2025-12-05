import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { users } from './src/database/schema/users';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Default accounts for quick setup
const defaultAccounts = [
  {
    email: 'admin@howitworks.app',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    phoneNumber: '+2348012345678',
  },
  {
    email: 'facilitator@howitworks.app',
    password: 'Facilitator@123',
    firstName: 'John',
    lastName: 'Facilitator',
    role: 'facilitator' as const,
    phoneNumber: '+2348087654321',
  },
];

async function quickSetup() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Howitworks Quick Setup               ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log('Creating default admin and facilitator accounts...\n');

    for (const account of defaultAccounts) {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, account.email))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`⚠️  ${account.role} account already exists: ${account.email}`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 12);

      // Create user
      await db
        .insert(users)
        .values({
          email: account.email,
          password: hashedPassword,
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role,
          phoneNumber: account.phoneNumber,
          isActive: true,
          isEmailVerified: true,
        });

      console.log(`✅ ${account.role.charAt(0).toUpperCase() + account.role.slice(1)} account created!`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   🔑 Password: ${account.password}\n`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Summary of Created Accounts');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('👤 ADMIN ACCOUNT');
    console.log('   Email: admin@howitworks.app');
    console.log('   Password: Admin@123');
    console.log('   Dashboard: http://localhost:3001\n');
    
    console.log('👤 FACILITATOR ACCOUNT');
    console.log('   Email: facilitator@howitworks.app');
    console.log('   Password: Facilitator@123');
    console.log('   Dashboard: http://localhost:3001\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change these passwords in production!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error in quick setup:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

quickSetup();

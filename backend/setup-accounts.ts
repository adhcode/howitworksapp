import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { users } from './src/database/schema/users';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAccount(accountType: 'admin' | 'facilitator') {
  try {
    console.log(`\n🔐 Creating ${accountType} account...\n`);

    // Get account details
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = await question('Email: ');
    const phoneNumber = await question('Phone Number: ');
    const password = await question('Password (min 6 characters): ');

    // Validate inputs
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      console.log('❌ All fields are required!');
      return;
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters!');
      return;
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: accountType,
        phoneNumber,
        isActive: true,
        isEmailVerified: true, // Auto-verify admin and facilitator accounts
      })
      .returning();

    console.log(`\n✅ ${accountType.charAt(0).toUpperCase() + accountType.slice(1)} account created successfully!`);
    console.log('\n📋 Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👔 Role: ${accountType}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (accountType === 'admin') {
      console.log('🌐 Admin Dashboard: http://localhost:3001');
    }
    console.log('🔐 API Login: POST http://localhost:3000/auth/login');
    console.log('\n⚠️  IMPORTANT: Store these credentials securely!\n');

  } catch (error) {
    console.error('❌ Error creating account:', error);
    throw error;
  }
}

async function setupAccounts() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Howitworks Account Setup Wizard     ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Select account type to create:');
    console.log('1. Admin Account');
    console.log('2. Facilitator Account');
    console.log('3. Both (Admin + Facilitator)');
    console.log('4. Exit\n');

    const choice = await question('Enter your choice (1-4): ');

    switch (choice) {
      case '1':
        await createAccount('admin');
        break;
      case '2':
        await createAccount('facilitator');
        break;
      case '3':
        await createAccount('admin');
        await createAccount('facilitator');
        break;
      case '4':
        console.log('\n👋 Goodbye!\n');
        break;
      default:
        console.log('\n❌ Invalid choice!\n');
    }

  } catch (error) {
    console.error('❌ Error in setup:', error);
  } finally {
    rl.close();
    await pool.end();
  }
}

setupAccounts();

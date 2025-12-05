import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DATABASE_CONNECTION } from '../database/database.module';
import { users } from '../database/schema/users';

@Injectable()
export class SetupService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
  ) {}

  async quickSetup() {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Quick setup is disabled in production');
    }

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

    const createdAccounts: Array<{
      role: 'admin' | 'facilitator';
      email: string;
      password: string;
      status: string;
    }> = [];
    
    const existingAccounts: Array<{
      role: 'admin' | 'facilitator';
      email: string;
      status: string;
    }> = [];

    for (const account of defaultAccounts) {
      // Check if user already exists
      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.email, account.email))
        .limit(1);

      if (existingUser) {
        existingAccounts.push({
          role: account.role,
          email: account.email,
          status: 'already_exists',
        });
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 12);

      // Create user
      const [newUser] = await this.db
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
        })
        .returning();

      createdAccounts.push({
        role: account.role,
        email: account.email,
        password: account.password,
        status: 'created',
      });
    }

    return {
      success: true,
      message: 'Quick setup completed',
      created: createdAccounts,
      existing: existingAccounts,
      warning: 'Change these passwords immediately in production!',
    };
  }

  async createAccount(accountData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: 'admin' | 'facilitator';
  }) {
    // Validate role
    if (!['admin', 'facilitator'].includes(accountData.role)) {
      throw new BadRequestException('Role must be either admin or facilitator');
    }

    // Check if user already exists
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, accountData.email))
      .limit(1);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password length
    if (accountData.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(accountData.password, 12);

    // Create user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email: accountData.email,
        password: hashedPassword,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        role: accountData.role,
        phoneNumber: accountData.phoneNumber,
        isActive: true,
        isEmailVerified: true,
      })
      .returning();

    return {
      success: true,
      message: `${accountData.role.charAt(0).toUpperCase() + accountData.role.slice(1)} account created successfully`,
      account: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
      },
    };
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { users, NewUser, User } from '../database/schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async create(userData: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(userData).returning();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async findAll(): Promise<User[]> {
    return this.db.select().from(users);
  }

  async findTenants(): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.role, 'tenant'));
  }

  async findLandlords(): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.role, 'landlord'));
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    return user || null;
  }

  async verifyEmail(id: string): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        isEmailVerified: true, 
        emailVerificationToken: null,
        emailVerificationCode: null,
        emailVerificationCodeExpires: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateEmailVerificationToken(id: string, token: string): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        emailVerificationToken: token,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateEmailVerificationCode(id: string, code: string, expiresAt: Date): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        emailVerificationCode: code,
        emailVerificationCodeExpires: expiresAt,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.delete(users).where(eq(users.id, id));
    if (result.rowCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token));
    return user || null;
  }

  async updatePasswordResetToken(id: string, token: string, expiresAt: Date): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async clearPasswordResetToken(id: string): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordResetCode: null,
        passwordResetCodeExpires: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updatePasswordResetCode(id: string, code: string, expiresAt: Date): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        passwordResetCode: code,
        passwordResetCodeExpires: expiresAt,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async findByPasswordResetCode(email: string, code: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user || user.passwordResetCode !== code) {
      return null;
    }
    
    return user;
  }
}
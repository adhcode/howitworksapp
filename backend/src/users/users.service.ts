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

  async delete(id: string): Promise<void> {
    const result = await this.db.delete(users).where(eq(users.id, id));
    if (result.rowCount === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, like, gte, or, desc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../database/database.module';
import { artisans } from '../database/schema/artisans';
import { users } from '../database/schema/users';
import {
  RegisterArtisanDto,
  UpdateArtisanStatusDto,
  ArtisanFiltersDto,
  ArtisanResponseDto,
  ArtisanStatus,
} from './dto/artisan.dto';

@Injectable()
export class ArtisansService {
  private readonly logger = new Logger(ArtisansService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<any>,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Register a new artisan (public endpoint)
   */
  async registerArtisan(dto: RegisterArtisanDto): Promise<ArtisanResponseDto> {
    this.logger.log(`Registering new artisan: ${dto.fullName}`);

    try {
      const db = this.db;

      // Validate facilitator if provided
      if (dto.referredByFacilitatorId) {
        const facilitator = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, dto.referredByFacilitatorId),
              eq(users.role, 'facilitator')
            )
          )
          .limit(1);

        if (!facilitator.length) {
          throw new BadRequestException('Invalid facilitator reference');
        }
      }

      const [newArtisan] = await db
        .insert(artisans)
        .values({
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          specialty: dto.specialty,
          yearsOfExperience: dto.yearsOfExperience,
          refereeName: dto.refereeName,
          refereePhone: dto.refereePhone,
          additionalSkills: dto.additionalSkills,
          availability: dto.availability || 'Full-time',
          referredByFacilitatorId: dto.referredByFacilitatorId,
          status: ArtisanStatus.PENDING,
        })
        .returning();

      this.logger.log(`✅ Artisan registered: ${newArtisan.id}`);

      // TODO: Send notification to admin about new artisan registration

      return this.mapToResponseDto(newArtisan);
    } catch (error) {
      this.logger.error(`Failed to register artisan: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all artisans with filters (admin)
   */
  async getAllArtisans(filters: ArtisanFiltersDto): Promise<ArtisanResponseDto[]> {
    this.logger.log('Fetching artisans with filters');

    try {
      const db = this.db;

      let query = db
        .select({
          artisan: artisans,
          facilitatorFirstName: users.firstName,
          facilitatorLastName: users.lastName,
        })
        .from(artisans)
        .leftJoin(users, eq(artisans.referredByFacilitatorId, users.id));

      // Apply filters
      const conditions: any[] = [];

      if (filters.city) {
        conditions.push(eq(artisans.city, filters.city));
      }

      if (filters.state) {
        conditions.push(eq(artisans.state, filters.state));
      }

      if (filters.specialty) {
        conditions.push(eq(artisans.specialty, filters.specialty));
      }

      if (filters.status) {
        conditions.push(eq(artisans.status, filters.status));
      }

      if (filters.referredByFacilitatorId) {
        conditions.push(eq(artisans.referredByFacilitatorId, filters.referredByFacilitatorId));
      }

      if (filters.minExperience) {
        conditions.push(gte(artisans.yearsOfExperience, filters.minExperience));
      }

      if (filters.search) {
        conditions.push(
          or(
            like(artisans.fullName, `%${filters.search}%`),
            like(artisans.phoneNumber, `%${filters.search}%`),
            like(artisans.email, `%${filters.search}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.orderBy(desc(artisans.createdAt));

      return results.map((result) => ({
        ...this.mapToResponseDto(result.artisan),
        referredByFacilitatorName: result.facilitatorFirstName && result.facilitatorLastName
          ? `${result.facilitatorFirstName} ${result.facilitatorLastName}`
          : undefined,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch artisans: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get artisan by ID
   */
  async getArtisanById(id: string): Promise<ArtisanResponseDto> {
    this.logger.log(`Fetching artisan: ${id}`);

    try {
      const db = this.db;

      const result = await db
        .select({
          artisan: artisans,
          facilitatorFirstName: users.firstName,
          facilitatorLastName: users.lastName,
        })
        .from(artisans)
        .leftJoin(users, eq(artisans.referredByFacilitatorId, users.id))
        .where(eq(artisans.id, id))
        .limit(1);

      if (!result.length) {
        throw new NotFoundException('Artisan not found');
      }

      return {
        ...this.mapToResponseDto(result[0].artisan),
        referredByFacilitatorName: result[0].facilitatorFirstName && result[0].facilitatorLastName
          ? `${result[0].facilitatorFirstName} ${result[0].facilitatorLastName}`
          : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch artisan: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update artisan status (admin)
   */
  async updateArtisanStatus(id: string, dto: UpdateArtisanStatusDto): Promise<ArtisanResponseDto> {
    this.logger.log(`Updating artisan status: ${id} -> ${dto.status}`);

    try {
      const db = this.db;

      const [updated] = await db
        .update(artisans)
        .set({
          status: dto.status,
          adminNotes: dto.adminNotes,
          updatedAt: new Date(),
        })
        .where(eq(artisans.id, id))
        .returning();

      if (!updated) {
        throw new NotFoundException('Artisan not found');
      }

      this.logger.log(`✅ Artisan status updated: ${id}`);

      // TODO: Send notification to artisan about status change

      return this.mapToResponseDto(updated);
    } catch (error) {
      this.logger.error(`Failed to update artisan status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete artisan (admin)
   */
  async deleteArtisan(id: string): Promise<void> {
    this.logger.log(`Deleting artisan: ${id}`);

    try {
      const db = this.db;

      const result = await db
        .delete(artisans)
        .where(eq(artisans.id, id))
        .returning();

      if (!result.length) {
        throw new NotFoundException('Artisan not found');
      }

      this.logger.log(`✅ Artisan deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete artisan: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get artisans referred by a facilitator
   */
  async getArtisansByFacilitator(facilitatorId: string): Promise<ArtisanResponseDto[]> {
    this.logger.log(`Fetching artisans for facilitator: ${facilitatorId}`);

    try {
      const db = this.db;

      const results = await db
        .select()
        .from(artisans)
        .where(eq(artisans.referredByFacilitatorId, facilitatorId))
        .orderBy(desc(artisans.createdAt));

      return results.map((artisan) => this.mapToResponseDto(artisan));
    } catch (error) {
      this.logger.error(`Failed to fetch facilitator artisans: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get referral statistics for a facilitator
   */
  async getFacilitatorReferralStats(facilitatorId: string) {
    this.logger.log(`Fetching referral stats for facilitator: ${facilitatorId}`);

    try {
      const db = this.db;

      const stats = await db
        .select({
          total: sql<number>`count(*)::int`,
          pending: sql<number>`count(*) filter (where status = 'pending')::int`,
          approved: sql<number>`count(*) filter (where status = 'approved')::int`,
          rejected: sql<number>`count(*) filter (where status = 'rejected')::int`,
        })
        .from(artisans)
        .where(eq(artisans.referredByFacilitatorId, facilitatorId));

      return stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
    } catch (error) {
      this.logger.error(`Failed to fetch referral stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate referral link for facilitator
   */
  generateReferralLink(facilitatorId: string): string {
    const baseUrl = this.configService.get('ADMIN_DASHBOARD_URL', 'http://localhost:5173');
    return `${baseUrl}/register-artisan?ref=${facilitatorId}`;
  }

  /**
   * Map artisan to response DTO
   */
  private mapToResponseDto(artisan: any): ArtisanResponseDto {
    return {
      id: artisan.id,
      fullName: artisan.fullName,
      phoneNumber: artisan.phoneNumber,
      email: artisan.email,
      address: artisan.address,
      city: artisan.city,
      state: artisan.state,
      specialty: artisan.specialty,
      yearsOfExperience: artisan.yearsOfExperience,
      refereeName: artisan.refereeName,
      refereePhone: artisan.refereePhone,
      additionalSkills: artisan.additionalSkills,
      availability: artisan.availability,
      status: artisan.status,
      referredByFacilitatorId: artisan.referredByFacilitatorId,
      adminNotes: artisan.adminNotes,
      createdAt: artisan.createdAt,
      updatedAt: artisan.updatedAt,
    };
  }
}

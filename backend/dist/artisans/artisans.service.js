"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ArtisansService", {
    enumerable: true,
    get: function() {
        return ArtisansService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _drizzleorm = require("drizzle-orm");
const _nodepostgres = require("drizzle-orm/node-postgres");
const _databasemodule = require("../database/database.module");
const _artisans = require("../database/schema/artisans");
const _users = require("../database/schema/users");
const _artisandto = require("./dto/artisan.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let ArtisansService = class ArtisansService {
    /**
   * Register a new artisan (public endpoint)
   */ async registerArtisan(dto) {
        this.logger.log(`Registering new artisan: ${dto.fullName}`);
        try {
            const db = this.db;
            // Validate facilitator if provided
            if (dto.referredByFacilitatorId) {
                const facilitator = await db.select().from(_users.users).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_users.users.id, dto.referredByFacilitatorId), (0, _drizzleorm.eq)(_users.users.role, 'facilitator'))).limit(1);
                if (!facilitator.length) {
                    throw new _common.BadRequestException('Invalid facilitator reference');
                }
            }
            const [newArtisan] = await db.insert(_artisans.artisans).values({
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
                status: _artisandto.ArtisanStatus.PENDING
            }).returning();
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
   */ async getAllArtisans(filters) {
        this.logger.log('Fetching artisans with filters');
        try {
            const db = this.db;
            let query = db.select({
                artisan: _artisans.artisans,
                facilitatorFirstName: _users.users.firstName,
                facilitatorLastName: _users.users.lastName
            }).from(_artisans.artisans).leftJoin(_users.users, (0, _drizzleorm.eq)(_artisans.artisans.referredByFacilitatorId, _users.users.id));
            // Apply filters
            const conditions = [];
            if (filters.city) {
                conditions.push((0, _drizzleorm.eq)(_artisans.artisans.city, filters.city));
            }
            if (filters.state) {
                conditions.push((0, _drizzleorm.eq)(_artisans.artisans.state, filters.state));
            }
            if (filters.specialty) {
                conditions.push((0, _drizzleorm.eq)(_artisans.artisans.specialty, filters.specialty));
            }
            if (filters.status) {
                conditions.push((0, _drizzleorm.eq)(_artisans.artisans.status, filters.status));
            }
            if (filters.referredByFacilitatorId) {
                conditions.push((0, _drizzleorm.eq)(_artisans.artisans.referredByFacilitatorId, filters.referredByFacilitatorId));
            }
            if (filters.minExperience) {
                conditions.push((0, _drizzleorm.gte)(_artisans.artisans.yearsOfExperience, filters.minExperience));
            }
            if (filters.search) {
                conditions.push((0, _drizzleorm.or)((0, _drizzleorm.like)(_artisans.artisans.fullName, `%${filters.search}%`), (0, _drizzleorm.like)(_artisans.artisans.phoneNumber, `%${filters.search}%`), (0, _drizzleorm.like)(_artisans.artisans.email, `%${filters.search}%`)));
            }
            if (conditions.length > 0) {
                query = query.where((0, _drizzleorm.and)(...conditions));
            }
            const results = await query.orderBy((0, _drizzleorm.desc)(_artisans.artisans.createdAt));
            return results.map((result)=>({
                    ...this.mapToResponseDto(result.artisan),
                    referredByFacilitatorName: result.facilitatorFirstName && result.facilitatorLastName ? `${result.facilitatorFirstName} ${result.facilitatorLastName}` : undefined
                }));
        } catch (error) {
            this.logger.error(`Failed to fetch artisans: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Get artisan by ID
   */ async getArtisanById(id) {
        this.logger.log(`Fetching artisan: ${id}`);
        try {
            const db = this.db;
            const result = await db.select({
                artisan: _artisans.artisans,
                facilitatorFirstName: _users.users.firstName,
                facilitatorLastName: _users.users.lastName
            }).from(_artisans.artisans).leftJoin(_users.users, (0, _drizzleorm.eq)(_artisans.artisans.referredByFacilitatorId, _users.users.id)).where((0, _drizzleorm.eq)(_artisans.artisans.id, id)).limit(1);
            if (!result.length) {
                throw new _common.NotFoundException('Artisan not found');
            }
            return {
                ...this.mapToResponseDto(result[0].artisan),
                referredByFacilitatorName: result[0].facilitatorFirstName && result[0].facilitatorLastName ? `${result[0].facilitatorFirstName} ${result[0].facilitatorLastName}` : undefined
            };
        } catch (error) {
            this.logger.error(`Failed to fetch artisan: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Update artisan status (admin)
   */ async updateArtisanStatus(id, dto) {
        this.logger.log(`Updating artisan status: ${id} -> ${dto.status}`);
        try {
            const db = this.db;
            const [updated] = await db.update(_artisans.artisans).set({
                status: dto.status,
                adminNotes: dto.adminNotes,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_artisans.artisans.id, id)).returning();
            if (!updated) {
                throw new _common.NotFoundException('Artisan not found');
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
   */ async deleteArtisan(id) {
        this.logger.log(`Deleting artisan: ${id}`);
        try {
            const db = this.db;
            const result = await db.delete(_artisans.artisans).where((0, _drizzleorm.eq)(_artisans.artisans.id, id)).returning();
            if (!result.length) {
                throw new _common.NotFoundException('Artisan not found');
            }
            this.logger.log(`✅ Artisan deleted: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to delete artisan: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Get artisans referred by a facilitator
   */ async getArtisansByFacilitator(facilitatorId) {
        this.logger.log(`Fetching artisans for facilitator: ${facilitatorId}`);
        try {
            const db = this.db;
            const results = await db.select().from(_artisans.artisans).where((0, _drizzleorm.eq)(_artisans.artisans.referredByFacilitatorId, facilitatorId)).orderBy((0, _drizzleorm.desc)(_artisans.artisans.createdAt));
            return results.map((artisan)=>this.mapToResponseDto(artisan));
        } catch (error) {
            this.logger.error(`Failed to fetch facilitator artisans: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Get referral statistics for a facilitator
   */ async getFacilitatorReferralStats(facilitatorId) {
        this.logger.log(`Fetching referral stats for facilitator: ${facilitatorId}`);
        try {
            const db = this.db;
            const stats = await db.select({
                total: (0, _drizzleorm.sql)`count(*)::int`,
                pending: (0, _drizzleorm.sql)`count(*) filter (where status = 'pending')::int`,
                approved: (0, _drizzleorm.sql)`count(*) filter (where status = 'approved')::int`,
                rejected: (0, _drizzleorm.sql)`count(*) filter (where status = 'rejected')::int`
            }).from(_artisans.artisans).where((0, _drizzleorm.eq)(_artisans.artisans.referredByFacilitatorId, facilitatorId));
            return stats[0] || {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            };
        } catch (error) {
            this.logger.error(`Failed to fetch referral stats: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
   * Generate referral link for facilitator
   */ generateReferralLink(facilitatorId) {
        const baseUrl = this.configService.get('ADMIN_DASHBOARD_URL', 'http://localhost:5173');
        return `${baseUrl}/register-artisan?ref=${facilitatorId}`;
    }
    /**
   * Map artisan to response DTO
   */ mapToResponseDto(artisan) {
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
            updatedAt: artisan.updatedAt
        };
    }
    constructor(db, configService){
        this.db = db;
        this.configService = configService;
        this.logger = new _common.Logger(ArtisansService.name);
    }
};
ArtisansService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _nodepostgres.NodePgDatabase === "undefined" ? Object : _nodepostgres.NodePgDatabase,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], ArtisansService);

//# sourceMappingURL=artisans.service.js.map
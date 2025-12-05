"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersService", {
    enumerable: true,
    get: function() {
        return UsersService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../database/database.module");
const _schema = require("../database/schema");
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
let UsersService = class UsersService {
    async create(userData) {
        const [user] = await this.db.insert(_schema.users).values(userData).returning();
        return user;
    }
    async findById(id) {
        const [user] = await this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.id, id));
        return user || null;
    }
    async findByEmail(email) {
        const [user] = await this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.email, email));
        return user || null;
    }
    async findAll() {
        return this.db.select().from(_schema.users);
    }
    async findTenants() {
        return this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.role, 'tenant'));
    }
    async findLandlords() {
        return this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.role, 'landlord'));
    }
    async update(id, userData) {
        const [updatedUser] = await this.db.update(_schema.users).set({
            ...userData,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.users.id, id)).returning();
        if (!updatedUser) {
            throw new _common.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async findByEmailVerificationToken(token) {
        const [user] = await this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.emailVerificationToken, token));
        return user || null;
    }
    async verifyEmail(id) {
        const [updatedUser] = await this.db.update(_schema.users).set({
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationCode: null,
            emailVerificationCodeExpires: null,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.users.id, id)).returning();
        if (!updatedUser) {
            throw new _common.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async updateEmailVerificationToken(id, token) {
        const [updatedUser] = await this.db.update(_schema.users).set({
            emailVerificationToken: token,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.users.id, id)).returning();
        if (!updatedUser) {
            throw new _common.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async updateEmailVerificationCode(id, code, expiresAt) {
        const [updatedUser] = await this.db.update(_schema.users).set({
            emailVerificationCode: code,
            emailVerificationCodeExpires: expiresAt,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.users.id, id)).returning();
        if (!updatedUser) {
            throw new _common.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async updateLastLogin(id) {
        await this.db.update(_schema.users).set({
            lastLoginAt: new Date(),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.users.id, id));
    }
    async delete(id) {
        const result = await this.db.delete(_schema.users).where((0, _drizzleorm.eq)(_schema.users.id, id));
        if (result.rowCount === 0) {
            throw new _common.NotFoundException('User not found');
        }
    }
    async findByPasswordResetToken(token) {
        const [user] = await this.db.select().from(_schema.users).where((0, _drizzleorm.eq)(_schema.users.passwordResetToken, token));
        return user || null;
    }
    async updatePasswordResetToken(id, token, expiresAt) {
        const [updatedUser] = await this.db.update(_schema.users).set({
            passwordResetToken: token,
            passwordResetExpires: expiresAt,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.users.id, id)).returning();
        if (!updatedUser) {
            throw new _common.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async clearPasswordResetToken(id) {
        const [updatedUser] = await this.db.update(_schema.users).set({
            passwordResetToken: null,
            passwordResetExpires: null,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.users.id, id)).returning();
        if (!updatedUser) {
            throw new _common.NotFoundException('User not found');
        }
        return updatedUser;
    }
    constructor(db){
        this.db = db;
    }
};
UsersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], UsersService);

//# sourceMappingURL=users.service.js.map
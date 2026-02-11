"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ArtisansController", {
    enumerable: true,
    get: function() {
        return ArtisansController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _authdto = require("../auth/dto/auth.dto");
const _artisansservice = require("./artisans.service");
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
let ArtisansController = class ArtisansController {
    /**
   * PUBLIC: Register new artisan
   * No authentication required - public form
   */ async registerArtisan(dto) {
        return this.artisansService.registerArtisan(dto);
    }
    /**
   * ADMIN: Get all artisans with filters
   */ async getAllArtisans(filters) {
        return this.artisansService.getAllArtisans(filters);
    }
    /**
   * ADMIN: Get artisan by ID
   */ async getArtisanById(id) {
        return this.artisansService.getArtisanById(id);
    }
    /**
   * ADMIN: Update artisan status
   */ async updateArtisanStatus(id, dto) {
        return this.artisansService.updateArtisanStatus(id, dto);
    }
    /**
   * ADMIN: Delete artisan
   */ async deleteArtisan(id) {
        return this.artisansService.deleteArtisan(id);
    }
    /**
   * FACILITATOR: Get my referred artisans
   */ async getMyReferrals(req) {
        return this.artisansService.getArtisansByFacilitator(req.user.id);
    }
    /**
   * FACILITATOR: Get my referral statistics
   */ async getMyReferralStats(req) {
        return this.artisansService.getFacilitatorReferralStats(req.user.id);
    }
    /**
   * FACILITATOR: Get my referral link
   */ async getMyReferralLink(req) {
        const link = this.artisansService.generateReferralLink(req.user.id);
        return {
            referralLink: link
        };
    }
    /**
   * ADMIN: Get facilitator's referral link
   */ async getFacilitatorReferralLink(facilitatorId) {
        const link = this.artisansService.generateReferralLink(facilitatorId);
        return {
            referralLink: link
        };
    }
    constructor(artisansService){
        this.artisansService = artisansService;
    }
};
_ts_decorate([
    (0, _common.Post)('register'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _artisandto.RegisterArtisanDto === "undefined" ? Object : _artisandto.RegisterArtisanDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "registerArtisan", null);
_ts_decorate([
    (0, _common.Get)('admin/all'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _artisandto.ArtisanFiltersDto === "undefined" ? Object : _artisandto.ArtisanFiltersDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "getAllArtisans", null);
_ts_decorate([
    (0, _common.Get)('admin/:id'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "getArtisanById", null);
_ts_decorate([
    (0, _common.Patch)('admin/:id/status'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _artisandto.UpdateArtisanStatusDto === "undefined" ? Object : _artisandto.UpdateArtisanStatusDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "updateArtisanStatus", null);
_ts_decorate([
    (0, _common.Delete)('admin/:id'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "deleteArtisan", null);
_ts_decorate([
    (0, _common.Get)('facilitator/my-referrals'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "getMyReferrals", null);
_ts_decorate([
    (0, _common.Get)('facilitator/stats'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "getMyReferralStats", null);
_ts_decorate([
    (0, _common.Get)('facilitator/referral-link'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "getMyReferralLink", null);
_ts_decorate([
    (0, _common.Get)('admin/facilitator/:facilitatorId/referral-link'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    _ts_param(0, (0, _common.Param)('facilitatorId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ArtisansController.prototype, "getFacilitatorReferralLink", null);
ArtisansController = _ts_decorate([
    (0, _common.Controller)('artisans'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _artisansservice.ArtisansService === "undefined" ? Object : _artisansservice.ArtisansService
    ])
], ArtisansController);

//# sourceMappingURL=artisans.controller.js.map
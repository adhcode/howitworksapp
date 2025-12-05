"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantInvitationsController", {
    enumerable: true,
    get: function() {
        return TenantInvitationsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _tenantinvitationsservice = require("./tenant-invitations.service");
const _tenantinvitationdto = require("./dto/tenant-invitation.dto");
const _usersservice = require("../users/users.service");
const _jwt = require("@nestjs/jwt");
const _bcryptjs = /*#__PURE__*/ _interop_require_wildcard(require("bcryptjs"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
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
let TenantInvitationsController = class TenantInvitationsController {
    async createInvitation(createInvitationDto, req) {
        // Debug logging to check the user object
        console.log('=== CONTROLLER DEBUG ===');
        console.log('req.user:', JSON.stringify(req.user, null, 2));
        console.log('req.user.id:', req.user.id);
        console.log('req.user.id type:', typeof req.user.id);
        console.log('createInvitationDto:', JSON.stringify(createInvitationDto, null, 2));
        // Check if landlordId is valid
        const landlordId = req.user.id;
        if (!landlordId) {
            throw new Error('Landlord ID is missing from request');
        }
        console.log('Final landlordId to pass:', landlordId);
        console.log('=== END CONTROLLER DEBUG ===');
        const invitation = await this.tenantInvitationsService.createInvitation({
            ...createInvitationDto,
            landlordId: landlordId
        });
        return {
            success: true,
            data: {
                ...invitation,
                invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/tenant-signup?token=${invitation.invitationToken}`
            }
        };
    }
    async getInvitationByToken(token) {
        const invitation = await this.tenantInvitationsService.getInvitationByToken(token);
        if (!invitation) {
            return {
                success: false,
                data: null,
                message: 'Invitation not found'
            };
        }
        return {
            success: true,
            data: invitation
        };
    }
    async acceptInvitation(acceptInvitationDto, req) {
        const invitation = await this.tenantInvitationsService.acceptInvitation(acceptInvitationDto.token, req.user.id);
        return {
            success: true,
            data: invitation,
            message: 'Invitation accepted successfully'
        };
    }
    async getMyInvitations(req) {
        console.log('🔍 GET /my-invitations called');
        console.log('🔍 Landlord ID from JWT:', req.user.id);
        console.log('🔍 User object:', JSON.stringify(req.user, null, 2));
        const invitations = await this.tenantInvitationsService.getInvitationsByLandlord(req.user.id);
        console.log('🔍 Invitations found:', invitations.length);
        if (invitations.length > 0) {
            console.log('🔍 First invitation:', JSON.stringify(invitations[0], null, 2));
        }
        return {
            success: true,
            data: invitations
        };
    }
    async getMyTenants(req) {
        const tenants = await this.tenantInvitationsService.getAcceptedTenantsByLandlord(req.user.id);
        return {
            success: true,
            data: tenants
        };
    }
    async cancelInvitation(invitationId, req) {
        await this.tenantInvitationsService.cancelInvitation(invitationId, req.user.id);
        return {
            success: true,
            message: 'Invitation cancelled successfully'
        };
    }
    async validateToken(token) {
        const isValid = await this.tenantInvitationsService.validateInvitationToken(token);
        return {
            success: true,
            data: {
                isValid
            }
        };
    }
    async registerWithToken(signupDto) {
        console.log('=== TENANT REGISTRATION DEBUG ===');
        console.log('Signup DTO:', JSON.stringify(signupDto, null, 2));
        // Get invitation details
        const invitation = await this.tenantInvitationsService.getInvitationByToken(signupDto.token);
        console.log('Found invitation:', invitation ? 'YES' : 'NO');
        if (invitation) {
            console.log('Invitation status:', invitation.status);
            console.log('Invitation expires at:', invitation.expiresAt);
            console.log('Current time:', new Date());
        }
        if (!invitation) {
            console.log('REGISTRATION FAILED: Invalid invitation token');
            return {
                success: false,
                message: 'Invalid invitation token'
            };
        }
        if (invitation.status !== 'pending') {
            console.log('REGISTRATION FAILED: Invitation status is', invitation.status);
            return {
                success: false,
                message: 'Invitation is no longer valid'
            };
        }
        if (new Date() > invitation.expiresAt) {
            console.log('REGISTRATION FAILED: Invitation expired');
            return {
                success: false,
                message: 'Invitation has expired'
            };
        }
        // Check if user already exists with the provided email
        console.log('Checking existing user with email:', signupDto.email);
        const existingUser = await this.usersService.findByEmail(signupDto.email);
        if (existingUser) {
            console.log('REGISTRATION FAILED: User already exists');
            return {
                success: false,
                message: 'User with this email already exists'
            };
        }
        // Hash password
        const hashedPassword = await _bcryptjs.hash(signupDto.password, 12);
        // Create tenant user with the provided email
        console.log('Creating user with data:', {
            firstName: invitation.firstName,
            lastName: invitation.lastName,
            email: signupDto.email,
            phoneNumber: signupDto.phone || invitation.phone,
            role: 'tenant'
        });
        const user = await this.usersService.create({
            firstName: invitation.firstName,
            lastName: invitation.lastName,
            email: signupDto.email,
            password: hashedPassword,
            phoneNumber: signupDto.phone || invitation.phone || '',
            role: 'tenant',
            isActive: true
        });
        console.log('User created successfully:', user.id);
        // Accept the invitation
        console.log('Accepting invitation...');
        await this.tenantInvitationsService.acceptInvitation(signupDto.token, user.id);
        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };
        const accessToken = this.jwtService.sign(payload);
        console.log('REGISTRATION SUCCESS: User registered and invitation accepted');
        console.log('=== END TENANT REGISTRATION DEBUG ===');
        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                },
                accessToken
            },
            message: 'Account created successfully'
        };
    }
    constructor(tenantInvitationsService, usersService, jwtService){
        this.tenantInvitationsService = tenantInvitationsService;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Create a tenant invitation'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Invitation created successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantinvitationdto.CreateTenantInvitationDto === "undefined" ? Object : _tenantinvitationdto.CreateTenantInvitationDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "createInvitation", null);
_ts_decorate([
    (0, _common.Get)('token/:token'),
    (0, _swagger.ApiOperation)({
        summary: 'Get invitation details by token'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Invitation details retrieved'
    }),
    _ts_param(0, (0, _common.Param)('token')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "getInvitationByToken", null);
_ts_decorate([
    (0, _common.Post)('accept'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Accept a tenant invitation'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Invitation accepted successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantinvitationdto.AcceptInvitationDto === "undefined" ? Object : _tenantinvitationdto.AcceptInvitationDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "acceptInvitation", null);
_ts_decorate([
    (0, _common.Get)('my-invitations'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get invitations created by landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Invitations retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "getMyInvitations", null);
_ts_decorate([
    (0, _common.Get)('my-tenants'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get accepted tenants by landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Tenants retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "getMyTenants", null);
_ts_decorate([
    (0, _common.Patch)(':id/cancel'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Cancel a tenant invitation'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Invitation cancelled successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "cancelInvitation", null);
_ts_decorate([
    (0, _common.Get)('validate/:token'),
    (0, _swagger.ApiOperation)({
        summary: 'Validate invitation token'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Token validation result'
    }),
    _ts_param(0, (0, _common.Param)('token')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "validateToken", null);
_ts_decorate([
    (0, _common.Post)('register-with-token'),
    (0, _swagger.ApiOperation)({
        summary: 'Register tenant with invitation token'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Tenant registered successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantinvitationdto.TenantSignupWithTokenDto === "undefined" ? Object : _tenantinvitationdto.TenantSignupWithTokenDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantInvitationsController.prototype, "registerWithToken", null);
TenantInvitationsController = _ts_decorate([
    (0, _swagger.ApiTags)('tenant-invitations'),
    (0, _common.Controller)('tenant-invitations'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantinvitationsservice.TenantInvitationsService === "undefined" ? Object : _tenantinvitationsservice.TenantInvitationsService,
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], TenantInvitationsController);

//# sourceMappingURL=tenant-invitations.controller.js.map
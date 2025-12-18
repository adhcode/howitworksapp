"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _authservice = require("./auth.service");
const _authdto = require("./dto/auth.dto");
const _changepassworddto = require("./dto/change-password.dto");
const _forgotpassworddto = require("./dto/forgot-password.dto");
const _jwtauthguard = require("./guards/jwt-auth.guard");
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
let AuthController = class AuthController {
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async verifyEmail(token) {
        return this.authService.verifyEmail(token);
    }
    async verifyEmailWithCode(body) {
        return this.authService.verifyEmailWithCode(body.email, body.code);
    }
    async resendVerification(email) {
        return this.authService.resendVerificationEmail(email);
    }
    async registerAdmin(registerDto) {
        // Force role to admin
        const adminRegisterDto = {
            ...registerDto,
            role: 'admin'
        };
        return this.authService.register(adminRegisterDto);
    }
    async testEmail(body) {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Test endpoint not available in production');
        }
        return this.authService.testEmail(body.email, body.name);
    }
    async manualVerifyEmail(body) {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Manual verification not available in production');
        }
        return this.authService.manualVerifyEmail(body.email);
    }
    async getCurrentUser(req) {
        return this.authService.getCurrentUser(req.user.id);
    }
    async changePassword(req, changePasswordDto) {
        return this.authService.changePassword(req.user.id, changePasswordDto);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
    }
    async verifyResetCode(body) {
        return this.authService.verifyResetCode(body.email, body.code);
    }
    async resetPasswordWithCode(body) {
        return this.authService.resetPasswordWithCode(body.email, body.code, body.password);
    }
    constructor(authService){
        this.authService = authService;
    }
};
_ts_decorate([
    (0, _common.Post)('register'),
    (0, _swagger.ApiOperation)({
        summary: 'Register a new user'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'User registered successfully. Verification email sent.'
    }),
    (0, _swagger.ApiResponse)({
        status: 409,
        description: 'User already exists'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authdto.RegisterDto === "undefined" ? Object : _authdto.RegisterDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
_ts_decorate([
    (0, _common.Post)('login'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Login user'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Login successful',
        type: _authdto.AuthResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Invalid credentials or email not verified'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authdto.LoginDto === "undefined" ? Object : _authdto.LoginDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
_ts_decorate([
    (0, _common.Get)('verify-email'),
    (0, _swagger.ApiOperation)({
        summary: 'Verify email address'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Email verified successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid or expired token'
    }),
    _ts_param(0, (0, _common.Query)('token')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
_ts_decorate([
    (0, _common.Post)('verify-email-code'),
    (0, _swagger.ApiOperation)({
        summary: 'Verify email address with code'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Email verified successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid or expired code'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailWithCode", null);
_ts_decorate([
    (0, _common.Post)('resend-verification'),
    (0, _swagger.ApiOperation)({
        summary: 'Resend verification email'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Verification email sent'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'User not found or email already verified'
    }),
    _ts_param(0, (0, _common.Body)('email')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
_ts_decorate([
    (0, _common.Post)('register-admin'),
    (0, _swagger.ApiOperation)({
        summary: 'Register a new admin user (public endpoint)'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Admin registered successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 409,
        description: 'User already exists'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authdto.RegisterDto === "undefined" ? Object : _authdto.RegisterDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "registerAdmin", null);
_ts_decorate([
    (0, _common.Post)('test-email'),
    (0, _swagger.ApiOperation)({
        summary: 'Test email sending (development only)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Test email sent'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "testEmail", null);
_ts_decorate([
    (0, _common.Post)('manual-verify'),
    (0, _swagger.ApiOperation)({
        summary: 'Manually verify email (development/testing only)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Email verified manually'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "manualVerifyEmail", null);
_ts_decorate([
    (0, _common.Get)('me'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    (0, _swagger.ApiOperation)({
        summary: 'Get current authenticated user'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Current user retrieved successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Unauthorized'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
_ts_decorate([
    (0, _common.Patch)('change-password'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    (0, _swagger.ApiOperation)({
        summary: 'Change user password'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Password changed successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Current password is incorrect'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid request'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _changepassworddto.ChangePasswordDto === "undefined" ? Object : _changepassworddto.ChangePasswordDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
_ts_decorate([
    (0, _common.Post)('forgot-password'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Request password reset'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Password reset email sent if account exists'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _forgotpassworddto.ForgotPasswordDto === "undefined" ? Object : _forgotpassworddto.ForgotPasswordDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
_ts_decorate([
    (0, _common.Post)('reset-password'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Reset password with token'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Password reset successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid or expired token'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _forgotpassworddto.ResetPasswordDto === "undefined" ? Object : _forgotpassworddto.ResetPasswordDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
_ts_decorate([
    (0, _common.Post)('verify-reset-code'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Verify password reset code'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Reset code verified successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid or expired code'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "verifyResetCode", null);
_ts_decorate([
    (0, _common.Post)('reset-password-with-code'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Reset password with verification code'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Password reset successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid or expired code'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "resetPasswordWithCode", null);
AuthController = _ts_decorate([
    (0, _swagger.ApiTags)('Authentication'),
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map
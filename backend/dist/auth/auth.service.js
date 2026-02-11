"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _bcryptjs = /*#__PURE__*/ _interop_require_wildcard(require("bcryptjs"));
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
const _usersservice = require("../users/users.service");
const _emailservice = require("../email/email.service");
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
let AuthService = class AuthService {
    async register(registerDto) {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new _common.ConflictException('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await _bcryptjs.hash(registerDto.password, 12);
        // Generate 6-digit verification code
        const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const emailVerificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        // Create user with email verification code
        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationCode,
            emailVerificationCodeExpires
        });
        // Send verification email with code
        try {
            await this.emailService.sendVerificationCodeEmail(user.email, user.firstName, emailVerificationCode);
        } catch (error) {
            console.error('Failed to send verification email:', error);
        // Don't fail registration if email fails, just log it
        }
        return {
            message: 'Registration successful. Please check your email for the verification code.',
            email: user.email
        };
    }
    async login(loginDto) {
        // Find user by email
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        // Verify password
        const isPasswordValid = await _bcryptjs.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        // Check if user is active
        if (!user.isActive) {
            throw new _common.UnauthorizedException('Account is deactivated');
        }
        // Check if email is verified
        if (!user.isEmailVerified) {
            throw new _common.UnauthorizedException('Please verify your email address before logging in. Check your inbox for the verification link.');
        }
        // Update last login time
        await this.usersService.updateLastLogin(user.id);
        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            accessToken
        };
    }
    async registerWithInvitation(invitationData) {
        // This method will be implemented when we inject TenantInvitationsService
        // For now, we'll add a placeholder
        throw new _common.BadRequestException('Invitation-based registration not yet implemented');
    }
    async verifyEmail(token) {
        const user = await this.usersService.findByEmailVerificationToken(token);
        if (!user) {
            throw new _common.BadRequestException('Invalid or expired verification token');
        }
        if (user.isEmailVerified) {
            throw new _common.BadRequestException('Email is already verified');
        }
        // Update user to mark email as verified
        await this.usersService.verifyEmail(user.id);
        // Send welcome email
        try {
            await this.emailService.sendWelcomeEmail(user.email, user.firstName);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
        return {
            message: 'Email verified successfully. You can now log in.'
        };
    }
    async verifyEmailWithCode(email, code) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new _common.BadRequestException('User not found');
        }
        if (user.isEmailVerified) {
            throw new _common.BadRequestException('Email is already verified');
        }
        if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
            throw new _common.BadRequestException('No verification code found. Please request a new one.');
        }
        // Check if code has expired
        if (user.emailVerificationCodeExpires < new Date()) {
            throw new _common.BadRequestException('Verification code has expired. Please request a new one.');
        }
        // Verify the code
        if (user.emailVerificationCode !== code) {
            throw new _common.BadRequestException('Invalid verification code');
        }
        // Update user to mark email as verified
        await this.usersService.verifyEmail(user.id);
        // Send welcome email
        try {
            await this.emailService.sendWelcomeEmail(user.email, user.firstName);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
        return {
            message: 'Email verified successfully. You can now log in.'
        };
    }
    async resendVerificationEmail(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new _common.BadRequestException('User not found');
        }
        if (user.isEmailVerified) {
            throw new _common.BadRequestException('Email is already verified');
        }
        // Generate new 6-digit verification code
        const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const emailVerificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await this.usersService.updateEmailVerificationCode(user.id, emailVerificationCode, emailVerificationCodeExpires);
        // Send verification email with code
        try {
            await this.emailService.sendVerificationCodeEmail(user.email, user.firstName, emailVerificationCode);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw new _common.BadRequestException('Failed to send verification email');
        }
        return {
            message: 'Verification code sent successfully.'
        };
    }
    async testEmail(email, name) {
        // Generate a test token
        const testToken = _crypto.randomBytes(32).toString('hex');
        try {
            await this.emailService.sendVerificationEmail(email, name, testToken);
            return {
                message: 'Test email sent successfully'
            };
        } catch (error) {
            throw new _common.BadRequestException(`Failed to send test email: ${error.message}`);
        }
    }
    async manualVerifyEmail(email) {
        // For testing purposes only - manually verify an email without token
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new _common.BadRequestException('User not found');
        }
        if (user.isEmailVerified) {
            throw new _common.BadRequestException('Email is already verified');
        }
        // Verify the email
        await this.usersService.verifyEmail(user.id);
        // Send welcome email
        try {
            await this.emailService.sendWelcomeEmail(user.email, user.firstName);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
        return {
            message: 'Email verified successfully (manual verification for testing)'
        };
    }
    async validateUser(userId) {
        return this.usersService.findById(userId);
    }
    async getCurrentUser(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new _common.UnauthorizedException('User not found');
        }
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            // Bank account details for landlords
            bankAccountName: user.bankAccountName,
            bankAccountNumber: user.bankAccountNumber,
            bankCode: user.bankCode,
            paystackRecipientCode: user.paystackRecipientCode
        };
    }
    async changePassword(userId, changePasswordDto) {
        try {
            // Get user from database
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new _common.UnauthorizedException('User not found');
            }
            // Verify current password
            const isCurrentPasswordValid = await _bcryptjs.compare(changePasswordDto.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new _common.UnauthorizedException('Current password is incorrect');
            }
            // Check if new password is same as current
            if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
                throw new _common.BadRequestException('New password must be different from current password');
            }
            // Hash new password
            const hashedPassword = await _bcryptjs.hash(changePasswordDto.newPassword, 12);
            // Update password in database
            await this.usersService.update(userId, {
                password: hashedPassword
            });
            console.log(`✅ Password changed successfully for user: ${userId}`);
            return {
                message: 'Password changed successfully'
            };
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        // Don't reveal if user exists or not for security
        if (!user) {
            return {
                message: 'If an account exists with this email, you will receive password reset instructions.'
            };
        }
        // Generate 6-digit password reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        // Store reset code
        await this.usersService.updatePasswordResetCode(user.id, resetCode, resetExpires);
        // Send password reset email with code
        try {
            await this.emailService.sendPasswordResetCodeEmail(user.email, user.firstName, resetCode);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            throw new _common.BadRequestException('Failed to send password reset email');
        }
        return {
            message: 'If an account exists with this email, you will receive password reset instructions.'
        };
    }
    async resetPassword(token, newPassword) {
        const user = await this.usersService.findByPasswordResetToken(token);
        if (!user) {
            throw new _common.BadRequestException('Invalid or expired reset token');
        }
        // Check if token has expired
        if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new _common.BadRequestException('Reset token has expired');
        }
        // Hash new password
        const hashedPassword = await _bcryptjs.hash(newPassword, 12);
        // Update password and clear reset token
        await this.usersService.update(user.id, {
            password: hashedPassword
        });
        await this.usersService.clearPasswordResetToken(user.id);
        return {
            message: 'Password has been reset successfully. You can now log in with your new password.'
        };
    }
    async verifyResetCode(email, code) {
        const user = await this.usersService.findByPasswordResetCode(email, code);
        if (!user) {
            throw new _common.BadRequestException('Invalid reset code');
        }
        // Check if code has expired
        if (!user.passwordResetCodeExpires || user.passwordResetCodeExpires < new Date()) {
            throw new _common.BadRequestException('Reset code has expired. Please request a new one.');
        }
        return {
            message: 'Reset code verified successfully',
            valid: true
        };
    }
    async resetPasswordWithCode(email, code, newPassword) {
        const user = await this.usersService.findByPasswordResetCode(email, code);
        if (!user) {
            throw new _common.BadRequestException('Invalid reset code');
        }
        // Check if code has expired
        if (!user.passwordResetCodeExpires || user.passwordResetCodeExpires < new Date()) {
            throw new _common.BadRequestException('Reset code has expired. Please request a new one.');
        }
        // Hash new password
        const hashedPassword = await _bcryptjs.hash(newPassword, 12);
        // Update password and clear reset code
        await this.usersService.update(user.id, {
            password: hashedPassword
        });
        await this.usersService.clearPasswordResetToken(user.id);
        return {
            message: 'Password has been reset successfully. You can now log in with your new password.'
        };
    }
    async deleteAccount(userId, password) {
        // Get user
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new _common.UnauthorizedException('User not found');
        }
        // Verify password
        const isPasswordValid = await _bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            throw new _common.UnauthorizedException('Incorrect password');
        }
        // Delete user account
        await this.usersService.delete(userId);
        return {
            message: 'Your account has been permanently deleted'
        };
    }
    constructor(usersService, jwtService, emailService){
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map
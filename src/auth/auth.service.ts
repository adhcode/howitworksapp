import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; email: string }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user with email verification token
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails, just log it
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    // Update last login time
    await this.usersService.updateLastLogin(user.id);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role as any,
      },
      accessToken,
    };
  }

  async registerWithInvitation(invitationData: {
    token: string;
    password: string;
    phone: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  }): Promise<AuthResponseDto> {
    // This method will be implemented when we inject TenantInvitationsService
    // For now, we'll add a placeholder
    throw new BadRequestException('Invitation-based registration not yet implemented');
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmailVerificationToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
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
      message: 'Email verified successfully. You can now log in.',
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.updateEmailVerificationToken(user.id, emailVerificationToken);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      message: 'Verification email sent successfully.',
    };
  }

  async testEmail(email: string, name: string): Promise<{ message: string }> {
    // Generate a test token
    const testToken = crypto.randomBytes(32).toString('hex');
    
    try {
      await this.emailService.sendVerificationEmail(email, name, testToken);
      return { message: 'Test email sent successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to send test email: ${error.message}`);
    }
  }

  async manualVerifyEmail(email: string): Promise<{ message: string }> {
    // For testing purposes only - manually verify an email without token
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
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
      message: 'Email verified successfully (manual verification for testing)',
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
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
      paystackRecipientCode: user.paystackRecipientCode,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      // Get user from database
      const user = await this.usersService.findById(userId);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Check if new password is same as current
      if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

      // Update password in database
      await this.usersService.update(userId, { password: hashedPassword });

      console.log(`✅ Password changed successfully for user: ${userId}`);

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return {
        message: 'If an account exists with this email, you will receive password reset instructions.',
      };
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token
    await this.usersService.updatePasswordResetToken(user.id, resetToken, resetExpires);

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }

    return {
      message: 'If an account exists with this email, you will receive password reset instructions.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await this.usersService.update(user.id, { password: hashedPassword });
    await this.usersService.clearPasswordResetToken(user.id);

    return {
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
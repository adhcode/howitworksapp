import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully. Verification email sent.' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string; email: string }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string): Promise<{ message: string }> {
    return this.authService.verifyEmail(token);
  }

  @Post('verify-email-code')
  @ApiOperation({ summary: 'Verify email address with code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyEmailWithCode(@Body() body: { email: string; code: string }): Promise<{ message: string }> {
    return this.authService.verifyEmailWithCode(body.email, body.code);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'User not found or email already verified' })
  async resendVerification(@Body('email') email: string): Promise<{ message: string }> {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('register-admin')
  @ApiOperation({ summary: 'Register a new admin user (public endpoint)' })
  @ApiResponse({ status: 201, description: 'Admin registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerAdmin(@Body() registerDto: RegisterDto): Promise<{ message: string; email: string }> {
    // Force role to admin
    const adminRegisterDto = { ...registerDto, role: 'admin' as any };
    return this.authService.register(adminRegisterDto);
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Test email sending (development only)' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async testEmail(@Body() body: { email: string; name: string }): Promise<{ message: string }> {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Test endpoint not available in production');
    }
    
    return this.authService.testEmail(body.email, body.name);
  }

  @Post('manual-verify')
  @ApiOperation({ summary: 'Manually verify email (development/testing only)' })
  @ApiResponse({ status: 200, description: 'Email verified manually' })
  async manualVerifyEmail(@Body() body: { email: string }): Promise<{ message: string }> {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Manual verification not available in production');
    }
    
    return this.authService.manualVerifyEmail(body.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: any) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if account exists' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password reset code' })
  @ApiResponse({ status: 200, description: 'Reset code verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyResetCode(@Body() body: { email: string; code: string }): Promise<{ message: string; valid: boolean }> {
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Post('reset-password-with-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with verification code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async resetPasswordWithCode(@Body() body: { email: string; code: string; password: string }): Promise<{ message: string }> {
    return this.authService.resetPasswordWithCode(body.email, body.code, body.password);
  }
}
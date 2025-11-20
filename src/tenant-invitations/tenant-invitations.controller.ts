import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantInvitationsService } from './tenant-invitations.service';
import { CreateTenantInvitationDto, AcceptInvitationDto, TenantSignupWithTokenDto } from './dto/tenant-invitation.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@ApiTags('tenant-invitations')
@Controller('tenant-invitations')
export class TenantInvitationsController {
  constructor(
    private readonly tenantInvitationsService: TenantInvitationsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tenant invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  async createInvitation(
    @Body() createInvitationDto: CreateTenantInvitationDto,
    @Request() req: any,
  ) {
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
      landlordId: landlordId,
    });



    return {
      success: true,
      data: {
        ...invitation,
        invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/tenant-signup?token=${invitation.invitationToken}`,
      },
    };
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  @ApiResponse({ status: 200, description: 'Invitation details retrieved' })
  async getInvitationByToken(@Param('token') token: string) {
    const invitation = await this.tenantInvitationsService.getInvitationByToken(token);
    
    if (!invitation) {
      return {
        success: false,
        data: null,
        message: 'Invitation not found',
      };
    }

    return {
      success: true,
      data: invitation,
    };
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a tenant invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Request() req: any,
  ) {
    const invitation = await this.tenantInvitationsService.acceptInvitation(
      acceptInvitationDto.token,
      req.user.id,
    );

    return {
      success: true,
      data: invitation,
      message: 'Invitation accepted successfully',
    };
  }

  @Get('my-invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invitations created by landlord' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved successfully' })
  async getMyInvitations(@Request() req: any) {
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
      data: invitations,
    };
  }

  @Get('my-tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get accepted tenants by landlord' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully' })
  async getMyTenants(@Request() req: any) {
    const tenants = await this.tenantInvitationsService.getAcceptedTenantsByLandlord(req.user.id);

    return {
      success: true,
      data: tenants,
    };
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a tenant invitation' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled successfully' })
  async cancelInvitation(
    @Param('id') invitationId: string,
    @Request() req: any,
  ) {
    await this.tenantInvitationsService.cancelInvitation(invitationId, req.user.id);

    return {
      success: true,
      message: 'Invitation cancelled successfully',
    };
  }

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validate invitation token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async validateToken(@Param('token') token: string) {
    const isValid = await this.tenantInvitationsService.validateInvitationToken(token);

    return {
      success: true,
      data: { isValid },
    };
  }

  @Post('register-with-token')
  @ApiOperation({ summary: 'Register tenant with invitation token' })
  @ApiResponse({ status: 201, description: 'Tenant registered successfully' })
  async registerWithToken(@Body() signupDto: TenantSignupWithTokenDto) {
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
        message: 'Invalid invitation token',
      };
    }

    if (invitation.status !== 'pending') {
      console.log('REGISTRATION FAILED: Invitation status is', invitation.status);
      return {
        success: false,
        message: 'Invitation is no longer valid',
      };
    }

    if (new Date() > invitation.expiresAt) {
      console.log('REGISTRATION FAILED: Invitation expired');
      return {
        success: false,
        message: 'Invitation has expired',
      };
    }

    // Check if user already exists with the provided email
    console.log('Checking existing user with email:', signupDto.email);
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      console.log('REGISTRATION FAILED: User already exists');
      return {
        success: false,
        message: 'User with this email already exists',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signupDto.password, 12);

    // Create tenant user with the provided email
    console.log('Creating user with data:', {
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: signupDto.email, // Use the email provided by the tenant
      phoneNumber: signupDto.phone || invitation.phone,
      role: 'tenant',
    });
    
    const user = await this.usersService.create({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: signupDto.email, // Use the email provided by the tenant
      password: hashedPassword,
      phoneNumber: signupDto.phone || invitation.phone || '',
      role: 'tenant',
      isActive: true,
    });

    console.log('User created successfully:', user.id);

    // Accept the invitation
    console.log('Accepting invitation...');
    await this.tenantInvitationsService.acceptInvitation(signupDto.token, user.id);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
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
          role: user.role,
        },
        accessToken,
      },
      message: 'Account created successfully',
    };
  }
}
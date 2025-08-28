import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('tenants')
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'List of tenants' })
  async getTenants() {
    return this.usersService.findTenants();
  }

  @Get('landlords')
  @ApiOperation({ summary: 'Get all landlords' })
  @ApiResponse({ status: 200, description: 'List of landlords' })
  async getLandlords() {
    return this.usersService.findLandlords();
  }
}
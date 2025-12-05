import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetupService } from './setup.service';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post('quick')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Quick setup - Create default admin and facilitator accounts',
    description: 'Creates default accounts for development. Should be disabled in production.'
  })
  @ApiResponse({ status: 201, description: 'Accounts created successfully' })
  @ApiResponse({ status: 400, description: 'Accounts already exist or setup disabled' })
  async quickSetup() {
    return this.setupService.quickSetup();
  }

  @Post('account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create custom admin or facilitator account',
    description: 'Creates a custom account with provided credentials'
  })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or account exists' })
  async createAccount(
    @Body() accountData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phoneNumber: string;
      role: 'admin' | 'facilitator';
    }
  ) {
    return this.setupService.createAccount(accountData);
  }
}

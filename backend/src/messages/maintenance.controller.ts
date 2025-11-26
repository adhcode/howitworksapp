import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { MessagesService } from './messages.service';
import { EnhancedMessagesService } from './enhanced-messages.service';
import { CreateMaintenanceRequestDto } from './dto/message.dto';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MaintenanceController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly enhancedMessagesService: EnhancedMessagesService
  ) {}

  @Post('requests')
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'Create a maintenance request (routes to facilitator if assigned)' })
  @ApiResponse({ status: 201, description: 'Maintenance request created successfully' })
  async createRequest(@Request() req, @Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto) {
    return this.enhancedMessagesService.createMaintenanceRequestWithRouting(req.user.id, createMaintenanceRequestDto);
  }

  @Get('requests')
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get maintenance requests' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  async getRequests(@Request() req) {
    if (req.user.role === 'facilitator') {
      return this.enhancedMessagesService.getFacilitatorMaintenanceRequests(req.user.id);
    }
    return this.messagesService.getMaintenanceRequests(req.user.id, req.user.role);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get a specific maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request retrieved successfully' })
  async getRequest(@Request() req, @Param('id') id: string) {
    // Implementation for getting specific maintenance request
    return { id, message: 'Get specific maintenance request - to be implemented' };
  }

  @Patch('requests/:id/status')
  @Roles(UserRole.LANDLORD, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Update maintenance request status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Request() req, 
    @Param('id') id: string, 
    @Body() updateDto: { status: string; notes?: string }
  ) {
    if (req.user.role === 'facilitator') {
      return this.enhancedMessagesService.updateMaintenanceRequestStatus(
        id, 
        updateDto.status, 
        req.user.id,
        updateDto.notes
      );
    }
    // For landlords, use existing service (to be enhanced later if needed)
    return { id, status: updateDto.status, message: 'Landlord status update - to be implemented' };
  }
} 
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
  async createRequest(@Request() req: any, @Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto) {
    return this.enhancedMessagesService.createMaintenanceRequestWithRouting(req.user.id, createMaintenanceRequestDto);
  }

  @Get('requests')
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get maintenance requests' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  async getRequests(@Request() req: any) {
    if (req.user.role === 'facilitator') {
      return this.enhancedMessagesService.getFacilitatorMaintenanceRequests(req.user.id);
    }
    return this.messagesService.getMaintenanceRequests(req.user.id, req.user.role);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get a specific maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request retrieved successfully' })
  async getRequest(@Request() req: any, @Param('id') id: string) {
    return this.enhancedMessagesService.getMaintenanceRequestById(id, req.user.id);
  }

  @Patch('requests/:id/status')
  @Roles(UserRole.LANDLORD, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Update maintenance request status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() updateDto: { status: string; notes?: string }
  ) {
    return this.enhancedMessagesService.updateMaintenanceRequestStatus(
      id, 
      updateDto.status, 
      req.user.id,
      updateDto.notes
    );
  }

  @Patch('requests/:id/priority')
  @Roles(UserRole.LANDLORD, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Update maintenance request priority' })
  @ApiResponse({ status: 200, description: 'Priority updated successfully' })
  async updatePriority(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() updateDto: { priority: string; notes?: string }
  ) {
    return this.enhancedMessagesService.updateMaintenanceRequestPriority(
      id, 
      updateDto.priority, 
      req.user.id,
      updateDto.notes
    );
  }

  @Post('requests/:id/comments')
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Add comment to maintenance request' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  async addComment(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() commentDto: { comment: string }
  ) {
    return this.enhancedMessagesService.addMaintenanceComment(id, req.user.id, commentDto.comment);
  }
} 
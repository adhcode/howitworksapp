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
import { MessagesService } from './messages.service';
import { CreateMaintenanceRequestDto } from './dto/message.dto';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MaintenanceController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Create a maintenance request' })
  @ApiResponse({ status: 201, description: 'Maintenance request created successfully' })
  async createRequest(@Request() req, @Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto) {
    return this.messagesService.createMaintenanceRequest(req.user.id, createMaintenanceRequestDto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get maintenance requests' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  async getRequests(@Request() req) {
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
  @ApiOperation({ summary: 'Update maintenance request status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(@Request() req, @Param('id') id: string, @Body() updateDto: { status: string }) {
    // Implementation for updating status
    return { id, status: updateDto.status, message: 'Status update - to be implemented' };
  }
} 
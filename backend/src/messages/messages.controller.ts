import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { MessagesService } from './messages.service';
import { EnhancedMessagesService } from './enhanced-messages.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly enhancedMessagesService: EnhancedMessagesService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Send a message (with facilitator routing for tenants)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    // Use enhanced service for facilitator routing
    return this.enhancedMessagesService.createWithFacilitatorRouting(req.user.id, createMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('conversation/:otherUserId')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getConversation(
    @Request() req,
    @Param('otherUserId') otherUserId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.messagesService.getConversation(req.user.id, otherUserId, paginationDto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.messagesService.markAsRead(id, req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.id);
  }

  // Facilitator-specific endpoints
  @Get('facilitator/conversations')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get facilitator conversations (includes tenant-landlord conversations)' })
  @ApiResponse({ status: 200, description: 'Facilitator conversations retrieved successfully' })
  async getFacilitatorConversations(@Request() req) {
    return this.enhancedMessagesService.getFacilitatorConversations(req.user.id);
  }

  @Get('tenant/facilitator')
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'Get tenant property facilitator contact' })
  @ApiResponse({ status: 200, description: 'Facilitator contact retrieved successfully' })
  async getTenantPropertyFacilitator(@Request() req) {
    const facilitator = await this.enhancedMessagesService.getTenantPropertyFacilitator(req.user.id);
    return {
      success: true,
      data: facilitator,
    };
  }
} 
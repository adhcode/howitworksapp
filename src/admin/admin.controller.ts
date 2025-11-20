import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { AdminService } from './admin.service';
import { FacilitatorsService } from '../facilitators/facilitators.service';
import { CreateUserDto, UpdateUserDto, AdminAssignFacilitatorDto } from './dto/admin.dto';
import { CreateFacilitatorDto } from '../facilitators/dto/facilitator.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly facilitatorsService: FacilitatorsService
  ) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    try {
      return await this.adminService.getDashboardStats();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch dashboard stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/revenue')
  async getRevenueAnalytics(@Query('timeframe') timeframe = '6m') {
    try {
      return await this.adminService.getRevenueAnalytics(timeframe);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch revenue analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/maintenance')
  async getMaintenanceAnalytics(@Query('timeframe') timeframe = '6m') {
    try {
      return await this.adminService.getMaintenanceAnalytics(timeframe);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch maintenance analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      role,
      search,
    });
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user (facilitator)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User status updated successfully' })
  async toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Get('properties')
  @ApiOperation({ summary: 'Get all properties with pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Properties retrieved successfully' })
  async getProperties(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return this.adminService.getProperties({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
    });
  }

  @Patch('properties/:id/assign-facilitator')
  @ApiOperation({ summary: 'Assign facilitator to property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator assigned successfully' })
  async assignFacilitatorToProperty(
    @Param('id') propertyId: string,
    @Body() assignFacilitatorDto: AdminAssignFacilitatorDto,
  ) {
    return this.adminService.assignFacilitatorToProperty(propertyId, assignFacilitatorDto.facilitatorId);
  }

  @Patch('properties/:id/remove-facilitator')
  @ApiOperation({ summary: 'Remove facilitator from property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator removed successfully' })
  async removeFacilitatorFromProperty(@Param('id') propertyId: string) {
    return this.adminService.removeFacilitatorFromProperty(propertyId);
  }

  @Get('analytics/properties')
  @ApiOperation({ summary: 'Get property analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property analytics retrieved successfully' })
  async getPropertyAnalytics(@Query('timeframe') timeframe: string = '30d') {
    return this.adminService.getPropertyAnalytics(timeframe);
  }

  // Facilitator Management Endpoints
  @Get('facilitators')
  @ApiOperation({ summary: 'Get all facilitators' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitators retrieved successfully' })
  async getAllFacilitators() {
    try {
      const facilitators = await this.facilitatorsService.getAllFacilitators();
      return {
        success: true,
        data: facilitators,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch facilitators',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('facilitators')
  @ApiOperation({ summary: 'Create a new facilitator' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Facilitator created successfully' })
  async createFacilitator(@Body() createFacilitatorDto: CreateFacilitatorDto) {
    try {
      const facilitator = await this.facilitatorsService.createFacilitator(createFacilitatorDto);
      return {
        success: true,
        message: 'Facilitator created successfully',
        data: facilitator,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create facilitator',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('facilitators/:id')
  @ApiOperation({ summary: 'Get facilitator by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator retrieved successfully' })
  async getFacilitatorById(@Param('id') id: string) {
    try {
      const facilitator = await this.facilitatorsService.getFacilitatorById(id);
      return {
        success: true,
        data: facilitator,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Facilitator not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('facilitators/:id/properties')
  @ApiOperation({ summary: 'Get properties assigned to facilitator' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Properties retrieved successfully' })
  async getFacilitatorProperties(@Param('id') id: string) {
    try {
      const properties = await this.facilitatorsService.getFacilitatorProperties(id);
      return {
        success: true,
        data: properties,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch facilitator properties',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('facilitators/:id/stats')
  @ApiOperation({ summary: 'Get facilitator dashboard statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getFacilitatorStats(@Param('id') id: string) {
    try {
      const stats = await this.facilitatorsService.getFacilitatorStats(id);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch facilitator stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('facilitators/:id/status')
  @ApiOperation({ summary: 'Update facilitator status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator status updated successfully' })
  async updateFacilitatorStatus(
    @Param('id') id: string,
    @Body() updateDto: { isActive: boolean },
    @Req() req: any
  ) {
    try {
      const facilitator = await this.facilitatorsService.updateFacilitatorStatus(
        id,
        updateDto.isActive,
        req.user.id
      );
      return {
        success: true,
        message: `Facilitator ${updateDto.isActive ? 'activated' : 'deactivated'} successfully`,
        data: facilitator,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update facilitator status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('facilitators/:id/reset-password')
  @ApiOperation({ summary: 'Reset facilitator password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successfully' })
  async resetFacilitatorPassword(@Param('id') id: string) {
    try {
      const result = await this.facilitatorsService.resetPassword(id);
      return {
        success: true,
        message: 'Password reset successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reset password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('facilitators/:id')
  @ApiOperation({ summary: 'Update facilitator details' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator updated successfully' })
  async updateFacilitator(
    @Param('id') id: string,
    @Body() updateDto: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      nextOfKinName?: string;
      nextOfKinPhone?: string;
      nextOfKinRelationship?: string;
    }
  ) {
    try {
      const facilitator = await this.facilitatorsService.updateFacilitator(id, updateDto);
      return {
        success: true,
        message: 'Facilitator updated successfully',
        data: facilitator,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update facilitator',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('facilitators/assign-property')
  @ApiOperation({ summary: 'Assign facilitator to property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator assigned successfully' })
  async assignFacilitatorToPropertyNew(
    @Body() assignDto: { facilitatorId: string; propertyId: string },
    @Req() req: any
  ) {
    try {
      const result = await this.facilitatorsService.assignFacilitatorToProperty(
        assignDto,
        req.user.id
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to assign facilitator',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('properties/:propertyId/facilitator')
  @ApiOperation({ summary: 'Remove facilitator from property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator removed successfully' })
  async removeFacilitatorFromPropertyNew(
    @Param('propertyId') propertyId: string,
    @Req() req: any
  ) {
    try {
      const result = await this.facilitatorsService.removeFacilitatorFromProperty(
        propertyId,
        req.user.id
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to remove facilitator',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Property Detail Endpoints
  @Get('properties/:id')
  @ApiOperation({ summary: 'Get property by ID with details' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property retrieved successfully' })
  async getPropertyById(@Param('id') id: string) {
    try {
      const property = await this.adminService.getPropertyById(id);
      return {
        success: true,
        data: property,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Property not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('properties/:id/units')
  @ApiOperation({ summary: 'Get units for a property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Units retrieved successfully' })
  async getPropertyUnits(@Param('id') id: string) {
    try {
      const units = await this.adminService.getPropertyUnits(id);
      return {
        success: true,
        data: units,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch property units',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('properties/:id/tenants')
  @ApiOperation({ summary: 'Get tenants for a property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tenants retrieved successfully' })
  async getPropertyTenants(@Param('id') id: string) {
    try {
      const tenants = await this.adminService.getPropertyTenants(id);
      return {
        success: true,
        data: tenants,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch property tenants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('properties/:id/maintenance')
  @ApiOperation({ summary: 'Get maintenance requests for a property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Maintenance requests retrieved successfully' })
  async getPropertyMaintenance(@Param('id') id: string) {
    try {
      const maintenance = await this.adminService.getPropertyMaintenance(id);
      return {
        success: true,
        data: maintenance,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch property maintenance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('properties/:id/payments')
  @ApiOperation({ summary: 'Get payments for a property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payments retrieved successfully' })
  async getPropertyPayments(@Param('id') id: string) {
    try {
      const payments = await this.adminService.getPropertyPayments(id);
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch property payments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Get all maintenance requests across all properties' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Maintenance requests retrieved successfully' })
  async getAllMaintenanceRequests(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    try {
      const maintenance = await this.adminService.getAllMaintenanceRequests({
        status,
        priority,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });
      return {
        success: true,
        data: maintenance,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch maintenance requests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('messages/conversations')
  @ApiOperation({ summary: 'Get all conversations for admin' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Conversations retrieved successfully' })
  async getAdminConversations(@Req() req: any) {
    try {
      const conversations = await this.adminService.getAdminConversations(req.user.id);
      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('messages/conversation/:otherUserId')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Messages retrieved successfully' })
  async getAdminConversation(
    @Req() req: any,
    @Param('otherUserId') otherUserId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    try {
      const messages = await this.adminService.getAdminConversation(
        req.user.id,
        otherUserId,
        {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
        }
      );
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message as admin' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Message sent successfully' })
  async sendAdminMessage(
    @Req() req: any,
    @Body() messageDto: {
      receiverId: string;
      subject?: string;
      content: string;
    }
  ) {
    try {
      const message = await this.adminService.sendAdminMessage(req.user.id, messageDto);
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('messages/unread-count')
  @ApiOperation({ summary: 'Get unread message count for admin' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unread count retrieved successfully' })
  async getAdminUnreadCount(@Req() req: any) {
    try {
      const count = await this.adminService.getAdminUnreadCount(req.user.id);
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch unread count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}



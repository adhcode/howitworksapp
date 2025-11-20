import { Controller, Post, Get, Body, Request, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  @ApiOperation({ summary: 'Register push notification token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        expoPushToken: { type: 'string', description: 'Expo push token' },
        platform: { type: 'string', enum: ['ios', 'android'] },
        deviceId: { type: 'string', description: 'Device ID (optional)' },
      },
      required: ['expoPushToken', 'platform'],
    },
  })
  @ApiResponse({ status: 200, description: 'Token registered successfully' })
  async registerToken(@Request() req: any, @Body() body: any) {
    await this.notificationsService.registerPushToken(
      req.user.id,
      body.expoPushToken,
      body.platform,
      body.deviceId
    );

    return {
      success: true,
      message: 'Push token registered successfully',
    };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  async getPreferences(@Request() req: any) {
    const preferences = await this.notificationsService.getUserPreferences(req.user.id);
    
    return {
      success: true,
      data: preferences,
    };
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentReminders: { type: 'boolean' },
        overdueNotifications: { type: 'boolean' },
        contractUpdates: { type: 'boolean' },
        maintenanceUpdates: { type: 'boolean' },
        generalNotifications: { type: 'boolean' },
        soundEnabled: { type: 'boolean' },
        vibrationEnabled: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Request() req: any, @Body() body: any) {
    await this.notificationsService.updateUserPreferences(req.user.id, body);
    
    return {
      success: true,
      message: 'Preferences updated successfully',
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get notification history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  async getHistory(
    @Request() req: any,
    @Query('limit') limit?: string
  ) {
    const history = await this.notificationsService.getNotificationHistory(
      req.user.id,
      limit ? parseInt(limit) : 50
    );
    
    return {
      success: true,
      data: history,
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Count retrieved successfully' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    
    return {
      success: true,
      count,
    };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    await this.notificationsService.markAsRead(req.user.id, id);
    
    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.user.id);
    
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  @Post('test')
  @ApiOperation({ summary: 'Send test notification (development only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['title', 'message'],
    },
  })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  async sendTestNotification(@Request() req: any, @Body() body: any) {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        message: 'Test notifications not allowed in production',
      };
    }

    await this.notificationsService.sendPushNotification(
      req.user.id,
      body.title,
      body.message,
      { type: 'test' }
    );
    
    return {
      success: true,
      message: 'Test notification sent',
    };
  }
}

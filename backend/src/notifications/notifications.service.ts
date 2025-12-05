import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { DATABASE_CONNECTION } from '../database/database.module';
import { pushTokens, notifications, NewPushToken, NewNotification } from '../database/schema/notifications';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotificationType } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Expo;

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {
    this.expo = new Expo();
    this.logger.log('✅ Expo Push Notification service initialized');
  }

  /**
   * Register or update a push token for a user
   */
  async registerPushToken(
    userId: string,
    token: string,
    deviceInfo?: { platform?: string; deviceName?: string }
  ) {
    try {
      // Validate token format
      if (!Expo.isExpoPushToken(token)) {
        throw new BadRequestException('Invalid Expo push token format');
      }

      // Check if token already exists
      const existing = await this.db
        .select()
        .from(pushTokens)
        .where(eq(pushTokens.token, token))
        .limit(1);

      if (existing.length > 0) {
        // Update existing token
        await this.db
          .update(pushTokens)
          .set({
            userId,
            isActive: true,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
            deviceType: deviceInfo?.platform || existing[0].deviceType,
            deviceName: deviceInfo?.deviceName || existing[0].deviceName,
          })
          .where(eq(pushTokens.token, token));

        this.logger.log(`✅ Updated push token for user ${userId}`);
      } else {
        // Insert new token
        const newToken: NewPushToken = {
          userId,
          token,
          deviceType: deviceInfo?.platform,
          deviceName: deviceInfo?.deviceName,
          isActive: true,
        };

        await this.db.insert(pushTokens).values(newToken);
        this.logger.log(`✅ Registered new push token for user ${userId}`);
      }

      return { success: true, message: 'Push token registered successfully' };
    } catch (error) {
      this.logger.error(`❌ Error registering push token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a notification to a single user
   */
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    type?: NotificationType
  ) {
    try {
      // Save notification to database
      const newNotification: NewNotification = {
        userId,
        title,
        body,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
        type,
      };

      const [notification] = await this.db
        .insert(notifications)
        .values(newNotification)
        .returning();

      this.logger.log(`📝 Notification saved to database: ${notification.id}`);

      // Get user's active push tokens
      const tokens = await this.db
        .select()
        .from(pushTokens)
        .where(and(
          eq(pushTokens.userId, userId),
          eq(pushTokens.isActive, true)
        ));

      if (tokens.length === 0) {
        this.logger.warn(`⚠️ No active push tokens for user ${userId}`);
        return {
          success: true,
          sent: false,
          reason: 'No active push tokens',
          notificationId: notification.id,
        };
      }

      // Filter valid tokens
      const validTokens = tokens.filter(t => Expo.isExpoPushToken(t.token));

      if (validTokens.length === 0) {
        this.logger.warn(`⚠️ No valid push tokens for user ${userId}`);
        return {
          success: true,
          sent: false,
          reason: 'No valid push tokens',
          notificationId: notification.id,
        };
      }

      // Prepare push messages
      const messages: ExpoPushMessage[] = validTokens.map(t => ({
        to: t.token,
        sound: 'default',
        title,
        body,
        data: { ...data, notificationId: notification.id },
        priority: 'high',
        channelId: type || 'default',
      }));

      // Send notifications in chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          this.logger.log(`📤 Sent ${chunk.length} notifications`);
        } catch (error) {
          this.logger.error(`❌ Error sending push notification chunk: ${error.message}`);
        }
      }

      // Update notification as sent
      await this.db
        .update(notifications)
        .set({
          pushSent: true,
          pushSentAt: new Date(),
        })
        .where(eq(notifications.id, notification.id));

      // Update last used timestamp for tokens
      for (const token of validTokens) {
        await this.db
          .update(pushTokens)
          .set({ lastUsedAt: new Date() })
          .where(eq(pushTokens.id, token.id));
      }

      // Check for errors in tickets
      const errors = tickets.filter(ticket => ticket.status === 'error');
      if (errors.length > 0) {
        this.logger.warn(`⚠️ ${errors.length} notifications failed to send`);
        errors.forEach(error => {
          this.logger.error(`Error: ${JSON.stringify(error)}`);
        });
      }

      this.logger.log(`✅ Notification sent successfully to user ${userId}`);

      return {
        success: true,
        sent: true,
        notificationId: notification.id,
        tickets,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send notifications to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
    type?: NotificationType
  ) {
    try {
      this.logger.log(`📤 Sending bulk notifications to ${userIds.length} users`);

      const results = await Promise.allSettled(
        userIds.map(userId => this.sendNotification(userId, title, body, data, type))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`✅ Bulk send complete: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        total: userIds.length,
        successful,
        failed,
        results,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending bulk notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    try {
      const userNotifications = await this.db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.sentAt))
        .limit(limit)
        .offset(offset);

      const total = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(eq(notifications.userId, userId));

      return {
        notifications: userNotifications,
        total: Number(total[0]?.count || 0),
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`❌ Error getting user notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      return Number(result[0]?.count || 0);
    } catch (error) {
      this.logger.error(`❌ Error getting unread count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const result = await this.db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ))
        .returning();

      if (result.length === 0) {
        throw new BadRequestException('Notification not found or access denied');
      }

      this.logger.log(`✅ Notification ${notificationId} marked as read`);

      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      this.logger.error(`❌ Error marking notification as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      await this.db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      this.logger.log(`✅ All notifications marked as read for user ${userId}`);

      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      this.logger.error(`❌ Error marking all as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deactivate a push token
   */
  async deactivateToken(token: string) {
    try {
      await this.db
        .update(pushTokens)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(pushTokens.token, token));

      this.logger.log(`✅ Token deactivated: ${token}`);

      return { success: true, message: 'Token deactivated' };
    } catch (error) {
      this.logger.error(`❌ Error deactivating token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.db
        .delete(notifications)
        .where(sql`${notifications.sentAt} < ${cutoffDate}`)
        .returning();

      this.logger.log(`🗑️ Deleted ${result.length} old notifications`);

      return {
        success: true,
        deleted: result.length,
        message: `Deleted notifications older than ${daysOld} days`,
      };
    } catch (error) {
      this.logger.error(`❌ Error deleting old notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send push notification directly to a token (for scheduler/cron jobs)
   */
  async sendPushNotificationToToken(
    token: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      if (!Expo.isExpoPushToken(token)) {
        throw new BadRequestException('Invalid Expo push token format');
      }

      const message: ExpoPushMessage = {
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
      };

      const tickets = await this.expo.sendPushNotificationsAsync([message]);
      
      this.logger.log(`📤 Push notification sent to token`);

      return {
        success: true,
        tickets,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending push notification to token: ${error.message}`);
      throw error;
    }
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { DATABASE_CONNECTION } from '../database/database.module';
import { eq, and, desc } from 'drizzle-orm';
import { pushTokens, notificationHistory, notificationPreferences } from '../database/schema/notifications';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Expo;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {
    this.expo = new Expo();
    this.logger.log('Expo Push Notification service initialized');
  }

  /**
   * Register a push token for a user
   */
  async registerPushToken(
    userId: string,
    expoPushToken: string,
    platform: string,
    deviceId?: string
  ): Promise<void> {
    try {
      // Validate token
      if (!Expo.isExpoPushToken(expoPushToken)) {
        throw new Error('Invalid Expo push token');
      }

      // Check if token already exists
      const existing = await this.db
        .select()
        .from(pushTokens)
        .where(eq(pushTokens.expoPushToken, expoPushToken))
        .limit(1);

      if (existing.length > 0) {
        // Update existing token
        await this.db
          .update(pushTokens)
          .set({
            userId,
            platform,
            deviceId,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(pushTokens.expoPushToken, expoPushToken));
      } else {
        // Insert new token
        await this.db.insert(pushTokens).values({
          userId,
          expoPushToken,
          platform,
          deviceId,
          isActive: true,
        });
      }

      this.logger.log(`Push token registered for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error registering push token:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a user
   */
  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // Get user's active push tokens
      const tokens = await this.db
        .select()
        .from(pushTokens)
        .where(and(
          eq(pushTokens.userId, userId),
          eq(pushTokens.isActive, true)
        ));

      if (tokens.length === 0) {
        this.logger.warn(`No push tokens found for user: ${userId}`);
        return;
      }

      // Check user preferences
      const prefs = await this.getUserPreferences(userId);
      if (!this.shouldSendNotification(prefs, data?.type)) {
        this.logger.log(`Notification skipped due to user preferences: ${userId}`);
        return;
      }

      // Create messages
      const messages: ExpoPushMessage[] = tokens.map(token => ({
        to: token.expoPushToken,
        sound: prefs.soundEnabled ? 'default' : undefined,
        title,
        body: message,
        data: data || {},
        priority: data?.priority || 'default',
      }));

      // Send notifications in chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          
          // Check for errors
          ticketChunk.forEach((ticket, index) => {
            if (ticket.status === 'error') {
              this.logger.error(`Error sending notification: ${ticket.message}`);
              // Deactivate token if it's invalid
              if (ticket.details?.error === 'DeviceNotRegistered') {
                this.deactivateToken(tokens[index].expoPushToken);
              }
            }
          });
        } catch (error) {
          this.logger.error('Error sending push notification chunk:', error);
        }
      }

      // Save to history
      await this.db.insert(notificationHistory).values({
        userId,
        title,
        message,
        type: data?.type || 'general',
        data,
        read: false,
      });

      this.logger.log(`Sent ${tickets.length} notifications to user: ${userId}`);
    } catch (error) {
      this.logger.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send notifications to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendPushNotification(userId, title, message, data)
    );
    await Promise.allSettled(promises);
  }

  /**
   * Get user's notification preferences
   */
  async getUserPreferences(userId: string): Promise<any> {
    try {
      const [prefs] = await this.db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      if (!prefs) {
        // Return defaults if no preferences set
        return {
          paymentReminders: true,
          overdueNotifications: true,
          contractUpdates: true,
          maintenanceUpdates: true,
          generalNotifications: true,
          soundEnabled: true,
          vibrationEnabled: true,
        };
      }

      return prefs;
    } catch (error) {
      this.logger.error('Error getting user preferences:', error);
      return {};
    }
  }

  /**
   * Update user's notification preferences
   */
  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const existing = await this.db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(notificationPreferences)
          .set({
            ...preferences,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.userId, userId));
      } else {
        await this.db.insert(notificationPreferences).values({
          userId,
          ...preferences,
        });
      }

      this.logger.log(`Preferences updated for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const history = await this.db
        .select()
        .from(notificationHistory)
        .where(eq(notificationHistory.userId, userId))
        .orderBy(desc(notificationHistory.sentAt))
        .limit(limit);

      return history;
    } catch (error) {
      this.logger.error('Error getting notification history:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await this.db
        .select()
        .from(notificationHistory)
        .where(and(
          eq(notificationHistory.userId, userId),
          eq(notificationHistory.read, false)
        ));

      return result.length;
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await this.db
        .update(notificationHistory)
        .set({ read: true })
        .where(and(
          eq(notificationHistory.id, notificationId),
          eq(notificationHistory.userId, userId)
        ));
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.db
        .update(notificationHistory)
        .set({ read: true })
        .where(eq(notificationHistory.userId, userId));
    } catch (error) {
      this.logger.error('Error marking all as read:', error);
    }
  }

  /**
   * Deactivate a push token
   */
  private async deactivateToken(expoPushToken: string): Promise<void> {
    try {
      await this.db
        .update(pushTokens)
        .set({ isActive: false })
        .where(eq(pushTokens.expoPushToken, expoPushToken));
    } catch (error) {
      this.logger.error('Error deactivating token:', error);
    }
  }

  /**
   * Check if notification should be sent based on preferences
   */
  private shouldSendNotification(preferences: any, notificationType: string): boolean {
    if (!preferences) return true;

    switch (notificationType) {
      case 'payment_reminder':
        return preferences.paymentReminders !== false;
      case 'payment_overdue':
        return preferences.overdueNotifications !== false;
      case 'contract_update':
      case 'contract_created':
        return preferences.contractUpdates !== false;
      case 'maintenance_update':
      case 'maintenance_assigned':
        return preferences.maintenanceUpdates !== false;
      default:
        return preferences.generalNotifications !== false;
    }
  }

  // Utility methods for common notification scenarios
  async notifyPaymentReminder(userId: string, amount: number, dueDate: string, contractId: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'Rent Payment Reminder',
      `Your rent payment of ₦${amount.toLocaleString()} is due soon`,
      {
        type: 'payment_reminder',
        contractId,
        amount,
        dueDate,
      }
    );
  }

  async notifyPaymentOverdue(userId: string, amount: number, contractId: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'Overdue Rent Payment',
      `Your rent payment of ₦${amount.toLocaleString()} is overdue`,
      {
        type: 'payment_overdue',
        contractId,
        amount,
        priority: 'high',
      }
    );
  }

  async notifyPaymentSuccess(userId: string, amount: number, contractId: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'Payment Successful',
      `Your rent payment of ₦${amount.toLocaleString()} has been processed`,
      {
        type: 'payment_success',
        contractId,
        amount,
      }
    );
  }

  async notifyMaintenanceUpdate(userId: string, title: string, status: string, maintenanceId: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'Maintenance Update',
      `Your maintenance request "${title}" is now ${status}`,
      {
        type: 'maintenance_update',
        maintenanceId,
        status,
      }
    );
  }

  async notifyMaintenanceAssigned(userId: string, title: string, facilitatorName: string, maintenanceId: string): Promise<void> {
    await this.sendPushNotification(
      userId,
      'Maintenance Assigned',
      `Your request "${title}" has been assigned to ${facilitatorName}`,
      {
        type: 'maintenance_assigned',
        maintenanceId,
        facilitatorName,
      }
    );
  }

  /**
   * SEND PUSH NOTIFICATION TO SPECIFIC TOKEN
   * 
   * Helper method for sending push notification to a specific token
   * Used by the notification-sender service
   */
  async sendPushNotificationToToken(
    token: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    if (!Expo.isExpoPushToken(token)) {
      this.logger.warn(`Invalid Expo push token: ${token}`);
      return;
    }

    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
    };

    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = await this.expo.sendPushNotificationsAsync(chunks[0]);

      if (tickets[0].status === 'error') {
        this.logger.error(`Push notification error: ${tickets[0].message}`);
      } else {
        this.logger.log(`Push notification sent successfully to token`);
      }
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }
}

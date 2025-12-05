"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationsService", {
    enumerable: true,
    get: function() {
        return NotificationsService;
    }
});
const _common = require("@nestjs/common");
const _exposerversdk = require("expo-server-sdk");
const _databasemodule = require("../database/database.module");
const _notifications = require("../database/schema/notifications");
const _drizzleorm = require("drizzle-orm");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let NotificationsService = class NotificationsService {
    /**
   * Register or update a push token for a user
   */ async registerPushToken(userId, token, deviceInfo) {
        try {
            // Validate token format
            if (!_exposerversdk.Expo.isExpoPushToken(token)) {
                throw new _common.BadRequestException('Invalid Expo push token format');
            }
            // Check if token already exists
            const existing = await this.db.select().from(_notifications.pushTokens).where((0, _drizzleorm.eq)(_notifications.pushTokens.token, token)).limit(1);
            if (existing.length > 0) {
                // Update existing token
                await this.db.update(_notifications.pushTokens).set({
                    userId,
                    isActive: true,
                    lastUsedAt: new Date(),
                    updatedAt: new Date(),
                    deviceType: deviceInfo?.platform || existing[0].deviceType,
                    deviceName: deviceInfo?.deviceName || existing[0].deviceName
                }).where((0, _drizzleorm.eq)(_notifications.pushTokens.token, token));
                this.logger.log(`✅ Updated push token for user ${userId}`);
            } else {
                // Insert new token
                const newToken = {
                    userId,
                    token,
                    deviceType: deviceInfo?.platform,
                    deviceName: deviceInfo?.deviceName,
                    isActive: true
                };
                await this.db.insert(_notifications.pushTokens).values(newToken);
                this.logger.log(`✅ Registered new push token for user ${userId}`);
            }
            return {
                success: true,
                message: 'Push token registered successfully'
            };
        } catch (error) {
            this.logger.error(`❌ Error registering push token: ${error.message}`);
            throw error;
        }
    }
    /**
   * Send a notification to a single user
   */ async sendNotification(userId, title, body, data, type) {
        try {
            // Save notification to database
            const newNotification = {
                userId,
                title,
                body,
                data: data ? JSON.parse(JSON.stringify(data)) : null,
                type
            };
            const [notification] = await this.db.insert(_notifications.notifications).values(newNotification).returning();
            this.logger.log(`📝 Notification saved to database: ${notification.id}`);
            // Get user's active push tokens
            const tokens = await this.db.select().from(_notifications.pushTokens).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_notifications.pushTokens.userId, userId), (0, _drizzleorm.eq)(_notifications.pushTokens.isActive, true)));
            if (tokens.length === 0) {
                this.logger.warn(`⚠️ No active push tokens for user ${userId}`);
                return {
                    success: true,
                    sent: false,
                    reason: 'No active push tokens',
                    notificationId: notification.id
                };
            }
            // Filter valid tokens
            const validTokens = tokens.filter((t)=>_exposerversdk.Expo.isExpoPushToken(t.token));
            if (validTokens.length === 0) {
                this.logger.warn(`⚠️ No valid push tokens for user ${userId}`);
                return {
                    success: true,
                    sent: false,
                    reason: 'No valid push tokens',
                    notificationId: notification.id
                };
            }
            // Prepare push messages
            const messages = validTokens.map((t)=>({
                    to: t.token,
                    sound: 'default',
                    title,
                    body,
                    data: {
                        ...data,
                        notificationId: notification.id
                    },
                    priority: 'high',
                    channelId: type || 'default'
                }));
            // Send notifications in chunks
            const chunks = this.expo.chunkPushNotifications(messages);
            const tickets = [];
            for (const chunk of chunks){
                try {
                    const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                    this.logger.log(`📤 Sent ${chunk.length} notifications`);
                } catch (error) {
                    this.logger.error(`❌ Error sending push notification chunk: ${error.message}`);
                }
            }
            // Update notification as sent
            await this.db.update(_notifications.notifications).set({
                pushSent: true,
                pushSentAt: new Date()
            }).where((0, _drizzleorm.eq)(_notifications.notifications.id, notification.id));
            // Update last used timestamp for tokens
            for (const token of validTokens){
                await this.db.update(_notifications.pushTokens).set({
                    lastUsedAt: new Date()
                }).where((0, _drizzleorm.eq)(_notifications.pushTokens.id, token.id));
            }
            // Check for errors in tickets
            const errors = tickets.filter((ticket)=>ticket.status === 'error');
            if (errors.length > 0) {
                this.logger.warn(`⚠️ ${errors.length} notifications failed to send`);
                errors.forEach((error)=>{
                    this.logger.error(`Error: ${JSON.stringify(error)}`);
                });
            }
            this.logger.log(`✅ Notification sent successfully to user ${userId}`);
            return {
                success: true,
                sent: true,
                notificationId: notification.id,
                tickets
            };
        } catch (error) {
            this.logger.error(`❌ Error sending notification: ${error.message}`);
            throw error;
        }
    }
    /**
   * Send notifications to multiple users
   */ async sendBulkNotifications(userIds, title, body, data, type) {
        try {
            this.logger.log(`📤 Sending bulk notifications to ${userIds.length} users`);
            const results = await Promise.allSettled(userIds.map((userId)=>this.sendNotification(userId, title, body, data, type)));
            const successful = results.filter((r)=>r.status === 'fulfilled').length;
            const failed = results.filter((r)=>r.status === 'rejected').length;
            this.logger.log(`✅ Bulk send complete: ${successful} successful, ${failed} failed`);
            return {
                success: true,
                total: userIds.length,
                successful,
                failed,
                results
            };
        } catch (error) {
            this.logger.error(`❌ Error sending bulk notifications: ${error.message}`);
            throw error;
        }
    }
    /**
   * Get notifications for a user
   */ async getUserNotifications(userId, limit = 50, offset = 0) {
        try {
            const userNotifications = await this.db.select().from(_notifications.notifications).where((0, _drizzleorm.eq)(_notifications.notifications.userId, userId)).orderBy((0, _drizzleorm.desc)(_notifications.notifications.sentAt)).limit(limit).offset(offset);
            const total = await this.db.select({
                count: (0, _drizzleorm.sql)`count(*)`
            }).from(_notifications.notifications).where((0, _drizzleorm.eq)(_notifications.notifications.userId, userId));
            return {
                notifications: userNotifications,
                total: Number(total[0]?.count || 0),
                limit,
                offset
            };
        } catch (error) {
            this.logger.error(`❌ Error getting user notifications: ${error.message}`);
            throw error;
        }
    }
    /**
   * Get unread notification count for a user
   */ async getUnreadCount(userId) {
        try {
            const result = await this.db.select({
                count: (0, _drizzleorm.sql)`count(*)`
            }).from(_notifications.notifications).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_notifications.notifications.userId, userId), (0, _drizzleorm.eq)(_notifications.notifications.isRead, false)));
            return Number(result[0]?.count || 0);
        } catch (error) {
            this.logger.error(`❌ Error getting unread count: ${error.message}`);
            throw error;
        }
    }
    /**
   * Mark a notification as read
   */ async markAsRead(notificationId, userId) {
        try {
            const result = await this.db.update(_notifications.notifications).set({
                isRead: true,
                readAt: new Date()
            }).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_notifications.notifications.id, notificationId), (0, _drizzleorm.eq)(_notifications.notifications.userId, userId))).returning();
            if (result.length === 0) {
                throw new _common.BadRequestException('Notification not found or access denied');
            }
            this.logger.log(`✅ Notification ${notificationId} marked as read`);
            return {
                success: true,
                message: 'Notification marked as read'
            };
        } catch (error) {
            this.logger.error(`❌ Error marking notification as read: ${error.message}`);
            throw error;
        }
    }
    /**
   * Mark all notifications as read for a user
   */ async markAllAsRead(userId) {
        try {
            await this.db.update(_notifications.notifications).set({
                isRead: true,
                readAt: new Date()
            }).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_notifications.notifications.userId, userId), (0, _drizzleorm.eq)(_notifications.notifications.isRead, false)));
            this.logger.log(`✅ All notifications marked as read for user ${userId}`);
            return {
                success: true,
                message: 'All notifications marked as read'
            };
        } catch (error) {
            this.logger.error(`❌ Error marking all as read: ${error.message}`);
            throw error;
        }
    }
    /**
   * Deactivate a push token
   */ async deactivateToken(token) {
        try {
            await this.db.update(_notifications.pushTokens).set({
                isActive: false,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_notifications.pushTokens.token, token));
            this.logger.log(`✅ Token deactivated: ${token}`);
            return {
                success: true,
                message: 'Token deactivated'
            };
        } catch (error) {
            this.logger.error(`❌ Error deactivating token: ${error.message}`);
            throw error;
        }
    }
    /**
   * Delete old notifications (cleanup job)
   */ async deleteOldNotifications(daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const result = await this.db.delete(_notifications.notifications).where((0, _drizzleorm.sql)`${_notifications.notifications.sentAt} < ${cutoffDate}`).returning();
            this.logger.log(`🗑️ Deleted ${result.length} old notifications`);
            return {
                success: true,
                deleted: result.length,
                message: `Deleted notifications older than ${daysOld} days`
            };
        } catch (error) {
            this.logger.error(`❌ Error deleting old notifications: ${error.message}`);
            throw error;
        }
    }
    /**
   * Send push notification directly to a token (for scheduler/cron jobs)
   */ async sendPushNotificationToToken(token, title, body, data) {
        try {
            if (!_exposerversdk.Expo.isExpoPushToken(token)) {
                throw new _common.BadRequestException('Invalid Expo push token format');
            }
            const message = {
                to: token,
                sound: 'default',
                title,
                body,
                data: data || {},
                priority: 'high'
            };
            const tickets = await this.expo.sendPushNotificationsAsync([
                message
            ]);
            this.logger.log(`📤 Push notification sent to token`);
            return {
                success: true,
                tickets
            };
        } catch (error) {
            this.logger.error(`❌ Error sending push notification to token: ${error.message}`);
            throw error;
        }
    }
    constructor(db){
        this.db = db;
        this.logger = new _common.Logger(NotificationsService.name);
        this.expo = new _exposerversdk.Expo();
        this.logger.log('✅ Expo Push Notification service initialized');
    }
};
NotificationsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], NotificationsService);

//# sourceMappingURL=notifications.service.js.map
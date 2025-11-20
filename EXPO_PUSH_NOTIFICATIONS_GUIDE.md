# Expo Push Notifications Implementation Guide

## ✅ Current Status

Good news! Push notifications are **already implemented** in your app! Here's what you have:

### What's Already Done:
- ✅ Notification service created (`mobile/app/services/notificationService.ts`)
- ✅ Expo Notifications package configured
- ✅ Permission handling
- ✅ Local notifications
- ✅ Push token registration
- ✅ Notification listeners
- ✅ Deep linking support
- ✅ Badge count management
- ✅ Notification preferences
- ✅ Android notification channels

## 🎯 How It Works

### Architecture:
```
Mobile App (Expo)
    ↓
Expo Push Token Generated
    ↓
Token Sent to Your Backend
    ↓
Backend Stores Token in Database
    ↓
Backend Sends Notification via Expo Push API
    ↓
Expo Push Service
    ↓
Apple/Google Push Services
    ↓
User's Device
```

## 📱 Features Implemented

### 1. Push Token Registration
```typescript
// Automatically gets Expo push token
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'a06508a1-b734-4818-920a-d3fabfe4178e'
});

// Sends to backend
await apiService.registerNotificationToken({
  expoPushToken: token,
  platform: Platform.OS,
  deviceId: Device.osInternalBuildId
});
```

### 2. Notification Types Supported
- **Payment Reminders** - 3 days before due date
- **Overdue Notifications** - When payment is late
- **Payment Success** - Confirmation after payment
- **Contract Created** - New rent contract
- **Contract Updates** - Changes to contract
- **Maintenance Updates** - Status changes
- **General Notifications** - System messages

### 3. Local Notifications
```typescript
// Schedule a local notification
await notificationService.schedulePaymentReminder(
  contractId,
  amount,
  dueDate
);
```

### 4. Deep Linking
Tapping notifications navigates to relevant screens:
- Payment notifications → Wallet screen
- Contract notifications → Home screen
- Maintenance notifications → Maintenance screen

### 5. Notification Preferences
Users can control:
- Payment reminders (on/off)
- Overdue notifications (on/off)
- Contract updates (on/off)
- General notifications (on/off)
- Sound (on/off)
- Vibration (on/off)

## 🔧 Backend Implementation Needed

### Step 1: Create Notification Schema

**File**: `backend/src/database/schema/notifications.ts`

```typescript
import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  expoPushToken: text('expo_push_token').notNull().unique(),
  platform: text('platform').notNull(), // 'ios' or 'android'
  deviceId: text('device_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  paymentReminders: boolean('payment_reminders').default(true),
  overdueNotifications: boolean('overdue_notifications').default(true),
  contractUpdates: boolean('contract_updates').default(true),
  generalNotifications: boolean('general_notifications').default(true),
  soundEnabled: boolean('sound_enabled').default(true),
  vibrationEnabled: boolean('vibration_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const notificationHistory = pgTable('notification_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  data: jsonb('data'),
  read: boolean('read').default(false),
  sentAt: timestamp('sent_at').defaultNow(),
});
```

### Step 2: Create Migration

```sql
-- backend/src/database/migrations/0010_create_notifications.sql

CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  payment_reminders BOOLEAN DEFAULT true,
  overdue_notifications BOOLEAN DEFAULT true,
  contract_updates BOOLEAN DEFAULT true,
  general_notifications BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_expo_token ON push_tokens(expo_push_token);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_history_read ON notification_history(read);
```

### Step 3: Install Expo Server SDK

```bash
cd backend
npm install expo-server-sdk
```

### Step 4: Create Notification Service

**File**: `backend/src/notifications/notifications.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { eq } from 'drizzle-orm';
import { pushTokens, notificationHistory } from '../database/schema/notifications';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Expo;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {
    this.expo = new Expo();
  }

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

      // Upsert token
      await this.db
        .insert(pushTokens)
        .values({
          userId,
          expoPushToken,
          platform,
          deviceId,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: pushTokens.expoPushToken,
          set: {
            userId,
            platform,
            deviceId,
            isActive: true,
            updatedAt: new Date(),
          },
        });

      this.logger.log(`Push token registered for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error registering push token:', error);
      throw error;
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // Get user's push tokens
      const tokens = await this.db
        .select()
        .from(pushTokens)
        .where(eq(pushTokens.userId, userId))
        .where(eq(pushTokens.isActive, true));

      if (tokens.length === 0) {
        this.logger.warn(`No push tokens found for user: ${userId}`);
        return;
      }

      // Create messages
      const messages: ExpoPushMessage[] = tokens.map(token => ({
        to: token.expoPushToken,
        sound: 'default',
        title,
        body: message,
        data: data || {},
      }));

      // Send notifications
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
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

  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendPushNotification(userId, title, message, data);
    }
  }
}
```

### Step 5: Create Notifications Controller

**File**: `backend/src/notifications/notifications.controller.ts`

```typescript
import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  async getPreferences(@Request() req: any) {
    // TODO: Implement
    return {
      success: true,
      data: {
        paymentReminders: true,
        overdueNotifications: true,
        contractUpdates: true,
        generalNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
      },
    };
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(@Request() req: any, @Body() body: any) {
    // TODO: Implement
    return {
      success: true,
      message: 'Preferences updated successfully',
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Request() req: any) {
    // TODO: Implement
    return {
      success: true,
      count: 0,
    };
  }
}
```

## 🚀 Usage Examples

### Send Payment Reminder
```typescript
// In your payment service
await notificationsService.sendPushNotification(
  tenantId,
  'Rent Payment Reminder',
  'Your rent payment of ₦50,000 is due in 3 days',
  {
    type: 'payment_reminder',
    contractId: contract.id,
    amount: 50000,
    dueDate: contract.nextPaymentDue,
  }
);
```

### Send Maintenance Update
```typescript
await notificationsService.sendPushNotification(
  tenantId,
  'Maintenance Update',
  'Your maintenance request has been assigned to a facilitator',
  {
    type: 'maintenance_update',
    maintenanceId: request.id,
    status: 'in_progress',
  }
);
```

### Send to Multiple Users
```typescript
await notificationsService.sendBulkNotifications(
  [tenant1Id, tenant2Id, tenant3Id],
  'System Maintenance',
  'The app will be under maintenance tonight from 2-4 AM',
  { type: 'system_announcement' }
);
```

## 🧪 Testing

### Test on Physical Device:
1. Install Expo Go app
2. Run your app: `npm start`
3. Scan QR code
4. Grant notification permissions
5. Check console for push token
6. Send test notification from backend

### Test Push Notifications:
```bash
# Use Expo's push notification tool
curl -H "Content-Type: application/json" \
  -X POST https://exp.host/--/api/v2/push/send \
  -d '{
    "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {"type": "test"}
  }'
```

## 📊 Notification Scenarios

### For Tenants:
1. **Payment Due** - 7 days, 3 days, 1 day before
2. **Payment Overdue** - Daily reminders
3. **Payment Received** - Confirmation
4. **Contract Expiring** - 30 days, 7 days before
5. **Maintenance Update** - Status changes
6. **New Message** - From landlord/facilitator

### For Landlords:
1. **Payment Received** - Tenant paid rent
2. **New Tenant** - Tenant accepted invitation
3. **Maintenance Request** - New issue reported
4. **Contract Expiring** - Tenant contract ending soon
5. **Withdrawal Complete** - Money transferred

### For Facilitators:
1. **New Maintenance** - Assigned to them
2. **Urgent Issue** - High priority maintenance
3. **Tenant Message** - New message received

## 🔒 Best Practices

1. **Don't Spam**: Limit notification frequency
2. **Respect Preferences**: Check user settings before sending
3. **Clear Messages**: Be concise and actionable
4. **Deep Linking**: Always include relevant data
5. **Handle Errors**: Token might be invalid/expired
6. **Batch Sending**: Use chunks for bulk notifications
7. **Track Delivery**: Monitor push ticket receipts

## 📱 Platform-Specific Notes

### iOS:
- Requires Apple Developer account for production
- Must configure APNs
- Test with TestFlight or physical device

### Android:
- Works with Expo Go immediately
- Firebase Cloud Messaging (FCM) handled by Expo
- Notification channels required (already configured)

## ✅ Checklist

- [x] Notification service created
- [x] Expo notifications configured
- [x] Permission handling implemented
- [x] Deep linking setup
- [ ] Backend endpoints created
- [ ] Database schema created
- [ ] Migration run
- [ ] Expo server SDK installed
- [ ] Test notifications sent
- [ ] Production APNs configured (iOS)

## 🎉 Summary

Your app already has a solid notification foundation! You just need to:

1. **Create backend endpoints** for token registration
2. **Add database tables** for tokens and preferences
3. **Install expo-server-sdk** in backend
4. **Send notifications** from your backend services

The mobile app is ready to receive notifications right now!

---

**Next Steps**: Implement the backend endpoints and start sending notifications!

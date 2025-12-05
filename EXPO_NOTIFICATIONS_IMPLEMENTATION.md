# Expo Push Notifications - Implementation Plan

## Overview
Implement real-time push notifications using Expo's notification service to keep users informed about important events in the property management system.

## Notification Types

### For Tenants
1. **Payment Reminders**
   - Rent due in 3 days
   - Rent overdue
   - Payment received confirmation

2. **Maintenance Updates**
   - Status changed (pending → in progress → completed)
   - Priority changed
   - New comment from landlord/facilitator

3. **Messages**
   - New message from landlord
   - New message from facilitator

4. **General**
   - Lease expiring soon
   - Important announcements

### For Landlords
1. **Maintenance Requests**
   - New maintenance request submitted
   - Urgent maintenance request

2. **Payments**
   - Payment received
   - Payment overdue

3. **Tenant Activity**
   - New tenant signed up
   - Tenant invitation accepted

4. **Messages**
   - New message from tenant

### For Facilitators
1. **Maintenance Requests**
   - New maintenance request assigned
   - Urgent maintenance request

2. **Messages**
   - New message from tenant

## Implementation Steps

### Phase 1: Mobile App Setup
1. Install Expo notifications package
2. Request notification permissions
3. Get and store push token
4. Handle incoming notifications
5. Handle notification taps

### Phase 2: Backend Setup
1. Create notifications module
2. Store push tokens in database
3. Create notification service
4. Integrate with Expo Push API
5. Add notification triggers

### Phase 3: Integration
1. Send notifications on key events
2. Handle notification preferences
3. Add notification history
4. Test on real devices

## Technical Architecture

### Mobile App
```
App Start
  ↓
Request Permissions
  ↓
Get Push Token
  ↓
Send Token to Backend
  ↓
Listen for Notifications
  ↓
Handle Notification Tap → Navigate to relevant screen
```

### Backend
```
Event Occurs (e.g., new maintenance request)
  ↓
Determine Recipients
  ↓
Get Push Tokens
  ↓
Format Notification
  ↓
Send to Expo Push API
  ↓
Log Notification
```

## Database Schema

### push_tokens Table
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  device_type VARCHAR(50), -- 'ios' or 'android'
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON push_tokens(token);
```

### notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional data for navigation
  type VARCHAR(50), -- 'payment', 'maintenance', 'message', etc.
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

## Notification Payload Format

```typescript
{
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  title: 'Maintenance Update',
  body: 'Your maintenance request status changed to In Progress',
  data: {
    type: 'maintenance',
    id: 'maintenance-request-id',
    screen: 'MaintenanceDetail',
    params: { id: 'maintenance-request-id' }
  },
  badge: 1, // Unread count
  priority: 'high',
  channelId: 'default'
}
```

## Mobile App Implementation

### 1. Install Dependencies
```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Create Notification Service
```typescript
// mobile/app/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
```

### 3. Update App.tsx
```typescript
useEffect(() => {
  // Register for notifications
  registerForPushNotifications().then(token => {
    if (token) {
      // Send token to backend
      apiService.registerPushToken(token);
    }
  });

  // Handle notification received while app is open
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  // Handle notification tap
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    handleNotificationTap(data);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}, []);

function handleNotificationTap(data: any) {
  // Navigate based on notification type
  switch (data.type) {
    case 'maintenance':
      router.push(`/maintenance-detail?id=${data.id}`);
      break;
    case 'payment':
      router.push('/wallet');
      break;
    case 'message':
      router.push('/messages');
      break;
    default:
      break;
  }
}
```

## Backend Implementation

### 1. Install Dependencies
```bash
npm install expo-server-sdk
npm install @types/expo-server-sdk --save-dev
```

### 2. Create Database Schema
```typescript
// backend/src/database/schema/notifications.ts
import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  deviceType: varchar('device_type', { length: 50 }),
  deviceName: varchar('device_name', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  data: jsonb('data'),
  type: varchar('type', { length: 50 }),
  isRead: boolean('is_read').default(false),
  sentAt: timestamp('sent_at').defaultNow(),
  readAt: timestamp('read_at'),
  pushSent: boolean('push_sent').default(false),
  pushSentAt: timestamp('push_sent_at'),
});
```

### 3. Create Notifications Module
```typescript
// backend/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

### 4. Create Notifications Service
```typescript
// backend/src/notifications/notifications.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { DATABASE_CONNECTION } from '../database/database.module';
import { pushTokens, notifications } from '../database/schema/notifications';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {
    this.expo = new Expo();
  }

  async registerPushToken(userId: string, token: string, deviceInfo?: any) {
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
        })
        .where(eq(pushTokens.token, token));
    } else {
      // Insert new token
      await this.db.insert(pushTokens).values({
        userId,
        token,
        deviceType: deviceInfo?.platform,
        deviceName: deviceInfo?.deviceName,
        isActive: true,
      });
    }

    return { success: true };
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    type?: string
  ) {
    // Save notification to database
    const [notification] = await this.db
      .insert(notifications)
      .values({
        userId,
        title,
        body,
        data,
        type,
      })
      .returning();

    // Get user's push tokens
    const tokens = await this.db
      .select()
      .from(pushTokens)
      .where(and(
        eq(pushTokens.userId, userId),
        eq(pushTokens.isActive, true)
      ));

    if (tokens.length === 0) {
      return { success: true, sent: false, reason: 'No push tokens' };
    }

    // Prepare messages
    const messages: ExpoPushMessage[] = tokens
      .filter(t => Expo.isExpoPushToken(t.token))
      .map(t => ({
        to: t.token,
        sound: 'default',
        title,
        body,
        data: { ...data, notificationId: notification.id },
        priority: 'high',
      }));

    if (messages.length === 0) {
      return { success: true, sent: false, reason: 'No valid tokens' };
    }

    // Send notifications
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
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

    return { success: true, sent: true, tickets };
  }

  async sendBulkNotifications(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
    type?: string
  ) {
    const results = await Promise.all(
      userIds.map(userId => this.sendNotification(userId, title, body, data, type))
    );
    return results;
  }

  async getUserNotifications(userId: string, limit = 50) {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.sentAt)
      .limit(limit);
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));

    return { success: true };
  }
}
```

## Notification Triggers

### Maintenance Request Created
```typescript
// In enhanced-messages.service.ts
async createMaintenanceRequestWithRouting(...) {
  // ... existing code ...
  
  // Send notification to assigned person
  await this.notificationsService.sendNotification(
    assignedTo,
    'New Maintenance Request',
    `${tenant.firstName} reported: ${title}`,
    {
      type: 'maintenance',
      id: request.id,
      screen: 'MaintenanceDetail',
    },
    'maintenance'
  );
}
```

### Status Updated
```typescript
// In enhanced-messages.service.ts
async updateMaintenanceRequestStatus(...) {
  // ... existing code ...
  
  // Notify tenant
  await this.notificationsService.sendNotification(
    request.tenantId,
    'Maintenance Update',
    `Your request "${request.title}" is now ${status}`,
    {
      type: 'maintenance',
      id: requestId,
      screen: 'MaintenanceDetail',
    },
    'maintenance'
  );
}
```

### Payment Received
```typescript
// In payment service
async processPayment(...) {
  // ... existing code ...
  
  // Notify landlord
  await this.notificationsService.sendNotification(
    landlordId,
    'Payment Received',
    `₦${amount} received from ${tenantName}`,
    {
      type: 'payment',
      screen: 'Wallet',
    },
    'payment'
  );
}
```

## Testing

### Test on Physical Device
1. Build development client
2. Install on device
3. Grant notification permissions
4. Trigger events
5. Verify notifications appear

### Test Notification Tap
1. Receive notification
2. Tap notification
3. Verify correct screen opens
4. Verify correct data passed

## Configuration

### app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF6B35",
      "androidMode": "default",
      "androidCollapsedTitle": "{{unread_count}} new notifications"
    }
  }
}
```

## Next Steps

1. ✅ Create implementation plan (this document)
2. ⏳ Install mobile dependencies
3. ⏳ Create notification service (mobile)
4. ⏳ Update app to register tokens
5. ⏳ Create database schema (backend)
6. ⏳ Create notifications module (backend)
7. ⏳ Integrate with existing services
8. ⏳ Test on physical devices
9. ⏳ Add notification preferences
10. ⏳ Deploy to production

## Estimated Timeline
- Mobile setup: 2 hours
- Backend setup: 3 hours
- Integration: 2 hours
- Testing: 2 hours
- **Total: ~9 hours**

## Status
📝 **PLANNED** - Ready to implement

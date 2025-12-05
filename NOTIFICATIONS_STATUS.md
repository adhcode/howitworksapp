# Expo Push Notifications - Installation Status

## ✅ Completed Steps

### 1. Dependencies Installed
- ✅ **Mobile**: `expo-notifications`, `expo-device`, `expo-constants`
- ✅ **Backend**: `expo-server-sdk`

### 2. Code Files Created
- ✅ `mobile/app/services/notificationService.ts` - Notification handling
- ✅ `mobile/app/context/NotificationContext.tsx` - React context
- ✅ `mobile/app/services/api.ts` - API methods added
- ✅ `backend/create_notifications_tables.sql` - Database schema

### 3. Documentation Created
- ✅ Complete implementation guide
- ✅ Installation instructions
- ✅ Quick start guide
- ✅ Troubleshooting guide

## ⏳ Next Steps (In Order)

### Step 1: Create Database Tables (5 minutes)
Run the SQL migration:
```bash
# From backend directory
psql -U your_username -d your_database -f create_notifications_tables.sql

# Or using your database client
# Copy and paste the contents of create_notifications_tables.sql
```

This creates:
- `push_tokens` table - Stores device tokens
- `notifications` table - Stores notification history

### Step 2: Create Backend Drizzle Schema (10 minutes)
Create `backend/src/database/schema/notifications.ts`:

```typescript
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

### Step 3: Create Notifications Module (30 minutes)

#### 3a. Create `backend/src/notifications/notifications.service.ts`
See `EXPO_NOTIFICATIONS_IMPLEMENTATION.md` for complete code (lines 300-450)

Key methods:
- `registerPushToken()` - Store device tokens
- `sendNotification()` - Send push notification
- `getUserNotifications()` - Get notification history
- `markAsRead()` - Mark notification as read

#### 3b. Create `backend/src/notifications/notifications.controller.ts`
```typescript
import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  async registerToken(@Request() req: any, @Body() body: { token: string; deviceInfo?: any }) {
    return this.notificationsService.registerPushToken(req.user.id, body.token, body.deviceInfo);
  }

  @Get()
  async getNotifications(@Request() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
```

#### 3c. Create `backend/src/notifications/notifications.module.ts`
```typescript
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

#### 3d. Update `backend/src/app.module.ts`
Add to imports:
```typescript
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // ... existing imports
    NotificationsModule,
  ],
})
```

### Step 4: Update Mobile App Layout (5 minutes)

Update `mobile/app/_layout.tsx` to wrap with NotificationProvider:

```typescript
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack>
          {/* Your existing routes */}
        </Stack>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

### Step 5: Test on Physical Device (15 minutes)

1. Build the app:
```bash
cd mobile
npx expo run:android
# or
npx expo run:ios
```

2. Grant notification permissions when prompted

3. Check console logs:
```
✅ Got push token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
✅ Push token registered with backend
```

4. Send test notification using Expo's tool:
   - Go to https://expo.dev/notifications
   - Paste your push token
   - Send test notification

5. Verify:
   - Notification appears on device
   - Tapping notification opens app
   - Navigation works correctly

### Step 6: Integrate with Events (30 minutes)

Add notification triggers to existing services:

#### In `enhanced-messages.service.ts`:
```typescript
// Inject NotificationsService
constructor(
  @Inject(DATABASE_CONNECTION) private readonly db: any,
  private readonly notificationsService: NotificationsService,
) {}

// When maintenance request is created
await this.notificationsService.sendNotification(
  assignedTo,
  'New Maintenance Request',
  `${tenant.firstName} reported: ${title}`,
  { type: 'maintenance', id: request.id },
  'maintenance'
);

// When status is updated
await this.notificationsService.sendNotification(
  request.tenantId,
  'Maintenance Update',
  `Your request "${request.title}" is now ${status}`,
  { type: 'maintenance', id: requestId },
  'maintenance'
);
```

#### In payment service:
```typescript
// When payment is received
await this.notificationsService.sendNotification(
  landlordId,
  'Payment Received',
  `₦${amount} from ${tenantName}`,
  { type: 'payment' },
  'payment'
);
```

## 📋 Checklist

- [x] Install mobile dependencies
- [x] Install backend dependencies
- [ ] Create database tables
- [ ] Create Drizzle schema
- [ ] Create notifications service
- [ ] Create notifications controller
- [ ] Create notifications module
- [ ] Update app.module.ts
- [ ] Update _layout.tsx
- [ ] Test on physical device
- [ ] Integrate with maintenance events
- [ ] Integrate with payment events
- [ ] Integrate with message events

## 🎯 Estimated Time Remaining

- Database setup: 5 minutes
- Backend module: 30 minutes
- Mobile layout update: 5 minutes
- Testing: 15 minutes
- Integration: 30 minutes

**Total: ~1.5 hours**

## 📚 Reference Documents

- `EXPO_NOTIFICATIONS_IMPLEMENTATION.md` - Complete implementation guide with all code
- `INSTALL_NOTIFICATIONS.md` - Detailed installation and configuration
- `NOTIFICATIONS_READY_TO_IMPLEMENT.md` - Quick start guide
- `NOTIFICATIONS_SUMMARY.md` - Complete overview

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section in `INSTALL_NOTIFICATIONS.md`
2. Verify all dependencies are installed
3. Check console logs for errors
4. Make sure you're using a physical device (not simulator)
5. Verify push token is being registered with backend

## 🚀 Quick Commands

```bash
# Test notification from command line
curl -X POST http://localhost:3003/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-id",
    "title": "Test Notification",
    "body": "This is a test",
    "data": { "type": "test" }
  }'

# Check if token is registered
curl http://localhost:3003/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ✅ Success Criteria

You'll know it's working when:
- ✅ App requests notification permissions
- ✅ Push token appears in console
- ✅ Token is saved in database
- ✅ Test notification appears on device
- ✅ Tapping notification opens correct screen
- ✅ Badge count updates
- ✅ Notifications work when app is closed

---

**Current Status**: Dependencies installed, ready for backend implementation
**Next Step**: Create database tables
**Estimated Time to Complete**: 1.5 hours

# Notification Screen Persistence Fix

## Problem
Notifications were not persisting on the notifications screen. When users navigated to the notifications screen, it would show an empty state even though notifications existed in the backend database.

## Root Cause
The notifications screen was using `useEffect` with an empty dependency array, which only runs once when the component mounts. This meant:
1. Notifications were loaded when the app started (in NotificationContext)
2. But when navigating to the notifications screen, it didn't reload from the backend
3. If the context state was cleared or reset, the screen would show empty

## Solution
Changed the notifications screen to use `useFocusEffect` instead of `useEffect`, following the pattern used in other screens in the app (property, tenants, dashboard).

## Changes Made

### 1. Updated `mobile/app/landlord/notifications.tsx`

**Before:**
```typescript
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const NotificationsScreen = () => {
  const { notifications, ... } = useNotifications();
  
  useEffect(() => {
    // Only runs once on mount
    if (notifications.some(n => !n.isRead)) {
      markAllAsRead();
    }
  }, []);
  
  // ...
}
```

**After:**
```typescript
import React, { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const NotificationsScreen = () => {
  const { notifications, loadNotifications, ... } = useNotifications();
  const { user } = useAuth();
  
  // Reload notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadNotifications(user.id);
      }
    }, [user?.id, loadNotifications])
  );
  
  // Mark as read after notifications are loaded
  useEffect(() => {
    if (notifications.some(n => !n.isRead)) {
      markAllAsRead();
    }
  }, [notifications]);
  
  // ...
}
```

### 2. Added Debug Logging to `mobile/app/context/NotificationContext.tsx`

Added comprehensive logging to help debug notification loading:
- Log when notifications are being loaded
- Log the raw response from backend
- Log the transformed notifications
- Log when state is updated

## How It Works Now

### When User Opens Notifications Screen
1. `useFocusEffect` triggers when screen comes into focus
2. Calls `loadNotifications(user.id)` to fetch from backend
3. Backend returns all notifications for the user
4. Notifications are transformed and stored in context state
5. Screen re-renders with the loaded notifications
6. Unread notifications are marked as read

### When User Navigates Away and Back
1. `useFocusEffect` triggers again when returning to screen
2. Fresh data is loaded from backend
3. Any new notifications are displayed
4. State is always in sync with backend

## Benefits

✅ **Always Fresh**: Notifications are reloaded every time screen is opened
✅ **Consistent**: Uses same pattern as other screens in the app
✅ **Reliable**: Backend is always the source of truth
✅ **Debuggable**: Added logging to track data flow

## Testing

To verify the fix works:

1. **Login to the app**
2. **Send a notification** (via backend or admin dashboard)
3. **Navigate to notifications screen** - should see the notification
4. **Navigate away** (to properties, tenants, etc.)
5. **Send another notification**
6. **Navigate back to notifications** - should see both notifications
7. **Close and reopen the app**
8. **Navigate to notifications** - should still see all notifications

## Related Files

- `mobile/app/landlord/notifications.tsx` - Notifications screen
- `mobile/app/context/NotificationContext.tsx` - Notification state management
- `mobile/app/services/api.ts` - API service with notification endpoints
- `backend/src/notifications/notifications.service.ts` - Backend notification service
- `backend/src/notifications/notifications.controller.ts` - Backend notification endpoints

## Future Improvements

Consider:
- Add pull-to-refresh on notifications screen
- Add loading indicator while fetching
- Cache notifications in AsyncStorage for offline viewing
- Add pagination for users with many notifications
- Add notification filtering/search

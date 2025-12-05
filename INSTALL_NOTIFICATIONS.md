# Install Expo Notifications

## Mobile App Dependencies

Run these commands in the `mobile` directory:

```bash
cd mobile

# Install Expo notifications packages
npx expo install expo-notifications expo-device expo-constants

# If you need to rebuild
npx expo prebuild --clean
```

## Backend Dependencies

Run these commands in the `backend` directory:

```bash
cd backend

# Install Expo Server SDK
npm install expo-server-sdk

# Install TypeScript types
npm install --save-dev @types/expo-server-sdk
```

## Configuration

### 1. Update app.json (mobile/app.json)

Add notification configuration:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF6B35",
      "androidMode": "default",
      "androidCollapsedTitle": "{{unread_count}} new notifications"
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

### 2. Create Notification Icon

Create a notification icon at `mobile/assets/notification-icon.png`:
- Size: 96x96 pixels
- Background: Transparent
- Color: White or your brand color

### 3. Update _layout.tsx

Wrap your app with NotificationProvider:

```typescript
import { NotificationProvider } from './context/NotificationContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {/* Your app content */}
      </NotificationProvider>
    </AuthProvider>
  );
}
```

## Testing

### Test on Physical Device

1. Build development client:
```bash
cd mobile
npx expo run:android
# or
npx expo run:ios
```

2. Grant notification permissions when prompted

3. Check console for push token:
```
✅ Got push token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
✅ Push token registered with backend
```

### Send Test Notification

Use Expo's push notification tool:
https://expo.dev/notifications

Or use the backend API:
```bash
curl -X POST http://localhost:3003/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-id",
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {
      "type": "test"
    }
  }'
```

## Troubleshooting

### "Must use physical device for Push Notifications"
- Push notifications don't work on simulators/emulators
- Use a real iOS or Android device

### "Failed to get push token"
- Make sure you're using a physical device
- Check that notification permissions are granted
- Verify your Expo project ID is correct

### Notifications not appearing
- Check notification permissions in device settings
- Verify push token is registered with backend
- Check backend logs for errors
- Test with Expo's push notification tool first

### Android: Notifications not showing
- Make sure notification channels are created
- Check Android notification settings
- Verify `useNextNotificationsApi: true` in app.json

### iOS: Notifications not showing
- Check iOS notification settings
- Verify APNs certificate is configured (for production)
- Make sure `UIBackgroundModes` includes `remote-notification`

## Production Setup

### iOS
1. Configure APNs in Apple Developer Console
2. Add push notification capability to your app
3. Generate APNs key
4. Upload to Expo

### Android
1. Configure Firebase Cloud Messaging
2. Download `google-services.json`
3. Place in mobile root directory
4. Update app.json with path

## Next Steps

After installation:
1. ✅ Install dependencies
2. ✅ Configure app.json
3. ✅ Create notification icon
4. ✅ Update _layout.tsx
5. ⏳ Create backend database schema
6. ⏳ Create backend notifications module
7. ⏳ Test on physical device
8. ⏳ Integrate with app events
9. ⏳ Deploy to production

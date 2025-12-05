import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiService } from './api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get Expo push token
 */
export async function registerForPushNotifications(): Promise<string | undefined> {
  let token: string | undefined;

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Create additional channels for different notification types
    await Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Maintenance',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('payment', {
      name: 'Payments',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('message', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#2196F3',
      sound: 'default',
    });
  }

  // Must use physical device for push notifications
  if (!Device.isDevice) {
    console.log('⚠️ Must use physical device for Push Notifications');
    return undefined;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Failed to get push notification permissions');
    return undefined;
  }

  try {
    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                     Constants.easConfig?.projectId;
    
    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    token = pushToken.data;
    console.log('✅ Got push token:', token);

    // Send token to backend
    if (token) {
      try {
        await apiService.registerPushToken(token, {
          platform: Platform.OS,
          deviceName: Device.deviceName || 'Unknown Device',
        });
        console.log('✅ Push token registered with backend');
      } catch (error) {
        console.error('❌ Failed to register push token with backend:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error getting push token:', error);
  }

  return token;
}

/**
 * Schedule a local notification (for testing or offline scenarios)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 1
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: {
      seconds,
    },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification permissions status
 */
export async function getNotificationPermissions() {
  return await Notifications.getPermissionsAsync();
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions() {
  return await Notifications.requestPermissionsAsync();
}

/**
 * Set badge count (iOS)
 */
export async function setBadgeCount(count: number) {
  if (Platform.OS === 'ios') {
    await Notifications.setBadgeCountAsync(count);
  }
}

/**
 * Get badge count (iOS)
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'ios') {
    return await Notifications.getBadgeCountAsync();
  }
  return 0;
}

/**
 * Clear badge (iOS)
 */
export async function clearBadge() {
  if (Platform.OS === 'ios') {
    await Notifications.setBadgeCountAsync(0);
  }
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get delivered notifications
 */
export async function getDeliveredNotifications() {
  return await Notifications.getPresentedNotificationsAsync();
}

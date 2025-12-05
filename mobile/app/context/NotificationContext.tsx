import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter, useSegments } from 'expo-router';
import { registerForPushNotifications, setBadgeCount } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  clearUserNotifications: () => void;
  loadNotifications: (userId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: undefined,
  notification: undefined,
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  clearUserNotifications: () => {},
  loadNotifications: async () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only register for notifications if user is authenticated
    if (isAuthenticated && user) {
      registerForPushNotifications().then(token => {
        setExpoPushToken(token);
      });

      // Listen for notifications received while app is open
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('📬 Notification received:', notification);
        setNotification(notification);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
      });

      // Listen for notification taps
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response);
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      });

      // Load initial unread count
      refreshUnreadCount();
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated, user]);

  // Update badge count when unread count changes
  useEffect(() => {
    setBadgeCount(unreadCount);
  }, [unreadCount]);

  const refreshUnreadCount = async () => {
    try {
      // TODO: Fetch from API
      // const response = await apiService.getUnreadNotificationCount();
      // setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const clearUserNotifications = () => {
    console.log('🧹 Clearing user notifications from memory');
    setNotification(undefined);
    setUnreadCount(0);
    setBadgeCount(0);
  };

  const loadNotifications = async (userId: string) => {
    console.log('📥 Loading notifications for user:', userId);
    try {
      // TODO: Fetch notifications from API
      // const response = await apiService.getNotifications(userId);
      // Process notifications and update state
      await refreshUnreadCount();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationTap = (data: any) => {
    console.log('🔔 Handling notification tap with data:', data);

    // Determine user role from segments or user object
    const isLandlord = user?.role === 'landlord';
    const isTenant = user?.role === 'tenant';
    const isFacilitator = user?.role === 'facilitator';

    try {
      switch (data.type) {
        case 'maintenance':
          if (isLandlord) {
            router.push(`/landlord/maintenance-detail?id=${data.id}`);
          } else if (isTenant) {
            router.push(`/tenant-screens/complaint-detail?id=${data.id}`);
          } else if (isFacilitator) {
            // TODO: Add facilitator route
            router.push(`/maintenance-detail?id=${data.id}`);
          }
          break;

        case 'payment':
          if (isLandlord) {
            router.push('/landlord/wallet');
          } else if (isTenant) {
            router.push('/tenant/wallet');
          }
          break;

        case 'message':
          if (isLandlord) {
            router.push('/landlord-screens/messages');
          } else if (isTenant) {
            router.push('/tenant-screens/messages');
          }
          break;

        case 'tenant_invitation':
          if (isTenant) {
            router.push('/tenant/tabs/home');
          }
          break;

        default:
          console.log('Unknown notification type:', data.type);
          break;
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        unreadCount,
        refreshUnreadCount,
        clearUserNotifications,
        loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

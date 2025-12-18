import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter, useSegments } from 'expo-router';
import { registerForPushNotifications, setBadgeCount } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  notifications: AppNotification[];
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  clearUserNotifications: () => void;
  loadNotifications: (userId: string) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: undefined,
  notification: undefined,
  notifications: [],
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  clearUserNotifications: () => {},
  loadNotifications: async () => {},
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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
        
        // Reload notifications from backend to get the latest
        if (user?.id) {
          loadNotifications(user.id);
        }
      });

      // Listen for notification taps
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response);
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      });

      // Load notifications and unread count
      if (user?.id) {
        loadNotifications(user.id);
        refreshUnreadCount();
      }
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

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.getUnreadNotificationCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      createdAt: new Date(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { apiService } = await import('../services/api');
      await apiService.markNotificationAsRead(id);
      
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { apiService } = await import('../services/api');
      await apiService.markAllNotificationsAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setBadgeCount(0);
  }, []);

  const clearUserNotifications = useCallback(() => {
    console.log('🧹 Clearing user notifications from memory');
    setNotification(undefined);
    setNotifications([]);
    setUnreadCount(0);
    setBadgeCount(0);
  }, []);

  const loadNotifications = useCallback(async (userId: string) => {
    console.log('📥 Loading notifications for user:', userId);
    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.getNotifications(50);
      
      console.log('📦 Raw response from backend:', JSON.stringify(response, null, 2));
      console.log('📊 Total notifications from backend:', response.total);
      console.log('📋 Notifications array length:', response.notifications?.length || 0);
      
      // Transform backend notifications to app format
      const transformedNotifications: AppNotification[] = response.notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.body,
        type: n.type || 'general',
        data: n.data,
        createdAt: new Date(n.sentAt),
        isRead: n.isRead,
      }));
      
      console.log('✅ Transformed notifications:', transformedNotifications.length);
      setNotifications(transformedNotifications);
      console.log('💾 Notifications set in state');
      
      await refreshUnreadCount();
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  }, [refreshUnreadCount]);

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
        notifications,
        unreadCount,
        refreshUnreadCount,
        clearUserNotifications,
        loadNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

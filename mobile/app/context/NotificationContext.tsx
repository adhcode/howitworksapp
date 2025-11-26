import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Simple in-memory storage for now (same as AuthContext - can be replaced with AsyncStorage later)
class SimpleStorage {
  private storage: { [key: string]: string } = {};

  async getItemAsync(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    this.storage[key] = value;
  }

  async deleteItemAsync(key: string): Promise<void> {
    delete this.storage[key];
  }
}

const storage = new SimpleStorage();

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'tenant_added' | 'property_added' | 'unit_added' | 'payment_received' | 'general';
  isRead: boolean;
  createdAt: Date;
  userId?: string; // Add userId to tie notifications to specific user
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  loadNotifications: (userId: string) => Promise<void>;
  clearUserNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load notifications for a specific user
  const loadNotifications = useCallback(async (userId: string) => {
    try {
      setCurrentUserId(userId);
      const storedNotifications = await storage.getItemAsync(`notifications_${userId}`);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt), // Convert back to Date object
        }));
        setNotifications(parsedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  }, []);

  // Save notifications to storage
  const saveNotifications = async (updatedNotifications: Notification[]) => {
    if (!currentUserId) return;

    try {
      await storage.setItemAsync(
        `notifications_${currentUserId}`,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      isRead: false,
      createdAt: new Date(),
      userId: currentUserId || undefined,
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (currentUserId) {
      storage.deleteItemAsync(`notifications_${currentUserId}`);
    }
  };

  // Clear notifications when user logs out (but keep them in storage)
  const clearUserNotifications = useCallback(() => {
    setNotifications([]);
    setCurrentUserId(null);
  }, []);

  // Helper functions to add specific types of notifications
  const notificationHelpers = {
    tenantAdded: (tenantName: string, propertyName: string) => {
      addNotification({
        title: 'New Tenant Added',
        message: `${tenantName} has been added to ${propertyName}`,
        type: 'tenant_added',
        data: { tenantName, propertyName },
      });
    },

    propertyAdded: (propertyName: string) => {
      addNotification({
        title: 'New Property Added',
        message: `${propertyName} has been successfully added to your portfolio`,
        type: 'property_added',
        data: { propertyName },
      });
    },

    unitAdded: (unitNumber: string, propertyName: string) => {
      addNotification({
        title: 'New Unit Added',
        message: `Unit ${unitNumber} has been added to ${propertyName}`,
        type: 'unit_added',
        data: { unitNumber, propertyName },
      });
    },

    paymentReceived: (amount: number, tenantName: string, propertyName: string) => {
      addNotification({
        title: 'Payment Received',
        message: `₦${amount.toLocaleString()} received from ${tenantName} at ${propertyName}`,
        type: 'payment_received',
        data: { amount, tenantName, propertyName },
      });
    },
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        loadNotifications,
        clearUserNotifications,
        ...notificationHelpers,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
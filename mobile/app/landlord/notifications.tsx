import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationsScreen = () => {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, clearNotifications, loadNotifications } = useNotifications();
  const { user } = useAuth();

  // Reload notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔔 NotificationsScreen focused');
      console.log('📊 Current notifications count:', notifications.length);
      
      // Reload notifications from backend
      if (user?.id) {
        console.log('🔄 Reloading notifications for user:', user.id);
        loadNotifications(user.id);
      }
    }, [user?.id, loadNotifications])
  );

  // Don't auto-mark all as read - let them stay visible
  // Users can manually mark as read if needed

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearNotifications },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tenant_added':
        return 'person-add';
      case 'property_added':
        return 'home';
      case 'unit_added':
        return 'apartment';
      case 'payment_received':
        return 'payment';
      default:
        return 'notifications';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No notifications yet</Text>
            <Text style={styles.emptyStateText}>
              You'll see notifications here when you add properties, tenants, or receive payments.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.isRead && styles.unreadNotification
                ]}
                onPress={() => markAsRead(notification.id)}
                activeOpacity={0.7}
              >
                {!notification.isRead && (
                  <View style={styles.unreadIndicator} />
                )}
                <View style={styles.notificationIcon}>
                  <MaterialIcons
                    name={getNotificationIcon(notification.type) as any}
                    size={24}
                    color={colors.secondary}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {formatDate(notification.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
    color: '#9CA3AF',
  },
});

export default NotificationsScreen;
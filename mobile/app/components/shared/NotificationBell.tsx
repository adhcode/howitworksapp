import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface NotificationBellProps {
  size?: number;
  onPress?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 44,
  onPress
}) => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to appropriate notifications screen based on user role
      if (user?.role === 'tenant') {
        // For now, we'll create a tenant notifications screen later
        console.log('Tenant notifications pressed');
      } else {
        router.push('/landlord/notifications');
      }
    }
  };

  const bellStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={[styles.bellBg, bellStyle]}>
        <MaterialIcons name="notifications" size={size * 0.5} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bellBg: {
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Outfit_700Bold',
    textAlign: 'center',
  },
});

export default NotificationBell;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../../types/api';
import colors from '../../theme/colors';

interface Props {
  user: User | null;
}

const EnhancedGreetingHeader: React.FC<Props> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(user?.firstName, user?.lastName)}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>
            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.notificationButton}>
        <View style={styles.notificationBadge}>
          <MaterialIcons name="notifications" size={20} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 28,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  textContainer: {
    flex: 1,
    marginLeft: 28

  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  notificationButton: {
    padding: 8,
  },
  notificationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});

export default EnhancedGreetingHeader;
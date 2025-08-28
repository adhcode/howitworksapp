import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface AvatarProps {
  size?: number;
  user?: any;
  showInitials?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  size = 44, 
  user: propUser, 
  showInitials = true 
}) => {
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser;

  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (user?.avatar || user?.profileImage) {
    return (
      <Image
        source={{ uri: user.avatar || user.profileImage }}
        style={[styles.avatar, avatarStyle]}
      />
    );
  }

  // Check if default avatar image exists
  if (!showInitials) {
    return (
      <Image
        source={require('../../assets/images/avatar.png')}
        style={[styles.avatar, avatarStyle]}
      />
    );
  }

  // Show initials
  return (
    <View style={[styles.avatarBg, avatarStyle, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.background,
  },
  avatarBg: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: 'Outfit_700Bold',
    color: '#fff',
  },
});

export default Avatar;
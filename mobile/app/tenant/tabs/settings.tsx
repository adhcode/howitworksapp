import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import Avatar from '../../components/shared/Avatar';
import { apiService } from '../../services/api';

const TenantSettingsScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleHelpSupport = () => {
    router.push('/tenant/help-support');
  };

  const handleChangePassword = () => {
    router.push('/tenant/change-password');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Show password confirmation
            Alert.prompt(
              'Confirm Password',
              'Please enter your password to confirm account deletion',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async (password) => {
                    if (!password) {
                      Alert.alert('Error', 'Password is required');
                      return;
                    }
                    
                    try {
                      await apiService.deleteAccount(password);
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been permanently deleted',
                        [
                          {
                            text: 'OK',
                            onPress: async () => {
                              await logout();
                              router.replace('/auth/login');
                            },
                          },
                        ]
                      );
                    } catch (error: any) {
                      Alert.alert(
                        'Error',
                        error.response?.data?.message || 'Failed to delete account. Please check your password and try again.'
                      );
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: handleHelpSupport,
    },
    {
      icon: 'lock',
      title: 'Change Password',
      subtitle: 'Update your account password',
      onPress: handleChangePassword,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>
              Manage your account and preferences
            </Text>
          </View>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Avatar size={80} user={user} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleContainer}>
                <MaterialIcons name="person" size={16} color={colors.secondary} />
                <Text style={styles.userRole}>Tenant</Text>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.optionsContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    index === menuItems.length - 1 && styles.lastOptionItem
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name={item.icon as any} size={20} color={colors.secondary} />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.optionText}>{item.title}</Text>
                      <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-forever" size={20} color="#fff" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
    marginLeft: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 16,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    marginLeft: 8,
  },
});

export default TenantSettingsScreen;
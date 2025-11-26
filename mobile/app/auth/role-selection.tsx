import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

const RoleSelectionScreen = () => {
  const router = useRouter();

  const handleRoleSelection = (role: 'landlord' | 'tenant') => {
    if (role === 'tenant') {
      // Tenants need to enter token first
      router.push('/auth/tenant-token');
    } else {
      // Landlords go directly to signup
      router.push(`/auth/signup?role=${role}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Who Are You?</Text>
          <Text style={styles.subtitle}>Choose your role to continue.</Text>
        </View>

        {/* Role Options */}
        <View style={styles.roleContainer}>
          {/* Landlord Option */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('landlord')}
            activeOpacity={0.7}
          >
            <View style={styles.roleHeader}>
              <Image
                source={require('../assets/images/landllord-role.png')}
                style={styles.roleIcon}
                resizeMode="contain"
              />
              <Text style={styles.roleTitle}>Landlord</Text>
            </View>
            <Text style={styles.roleDescription}>
              Manage properties, assign tenants, track rent and reports.
            </Text>
            <View style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue as Landlord</Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.secondary} />
            </View>
          </TouchableOpacity>

          {/* Tenant Option */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('tenant')}
            activeOpacity={0.7}
          >
            <View style={styles.roleHeader}>
              <Image
                source={require('../assets/images/tenant-role.png')}
                style={styles.roleIcon}
                resizeMode="contain"
              />
              <Text style={styles.roleTitle}>Tenant</Text>
            </View>
            <Text style={styles.roleDescription}>
              Pay rent, lodge maintenance requests, receive updates.
            </Text>
            <View style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue as Tenant</Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  roleContainer: {
    flex: 1,
    gap: 24,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
        
    
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
  },
  roleTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  roleDescription: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    lineHeight: 24,
    marginBottom: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
  },
});

export default RoleSelectionScreen;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';

const EnhancedQuickActions = () => {
  const router = useRouter();

  const actions = [
    {
      title: 'Send Notice',
      description: 'Notify tenants about important updates',
      icon: 'notifications-active',
      color: '#FF6B35',
      bgColor: '#FF6B3515',
      onPress: () => router.push('/landlord/send-notice'),
    },
    {
      title: 'Add New Property',
      description: 'Upload property details and units',
      icon: 'add-home',
      color: colors.secondary,
      bgColor: `${colors.secondary}15`,
      onPress: () => router.push('/landlord/add-property?from=dashboard'),
    },
    {
      title: 'Add New Tenant',
      description: 'Assign tenant to unit and generate token',
      icon: 'person-add',
      color: '#40B869',
      bgColor: '#40B86915',
      onPress: () => router.push('/landlord/assign-tenant'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quick Actions</Text>
      <Text style={styles.subheading}>
        Manage your properties and tenants efficiently
      </Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.title}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
              <MaterialIcons name={action.icon as any} size={24} color={action.color} />
            </View>
            
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle} numberOfLines={2}>
                {action.title}
              </Text>
              <Text style={styles.actionDescription} numberOfLines={2}>
                {action.description}
              </Text>
            </View>
            
            <MaterialIcons name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    marginBottom: 20,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    lineHeight: 18,
  },
});

export default EnhancedQuickActions;
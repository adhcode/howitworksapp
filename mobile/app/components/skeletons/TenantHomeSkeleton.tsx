import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';
import colors from '../../theme/colors';

export const TenantHomeSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Greeting Header */}
      <View style={styles.greetingSection}>
        <SkeletonLoader width={150} height={24} borderRadius={8} />
        <SkeletonLoader width={200} height={16} borderRadius={8} style={{ marginTop: 8 }} />
      </View>

      {/* Payment Card */}
      <View style={styles.paymentCard}>
        <SkeletonLoader width={120} height={16} borderRadius={8} />
        <SkeletonLoader width={180} height={36} borderRadius={8} style={{ marginTop: 12 }} />
        <SkeletonLoader width={140} height={14} borderRadius={8} style={{ marginTop: 8 }} />
        <SkeletonLoader width="100%" height={48} borderRadius={12} style={{ marginTop: 20 }} />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <SkeletonLoader width={120} height={20} borderRadius={8} style={{ marginBottom: 16 }} />
        <View style={styles.actionsGrid}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.actionCard}>
              <SkeletonLoader width={40} height={40} borderRadius={20} />
              <SkeletonLoader width={60} height={14} borderRadius={8} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Property Info */}
      <View style={styles.propertyCard}>
        <SkeletonLoader width={140} height={20} borderRadius={8} style={{ marginBottom: 16 }} />
        <SkeletonLoader width="100%" height={16} borderRadius={8} />
        <SkeletonLoader width="80%" height={16} borderRadius={8} style={{ marginTop: 8 }} />
        <SkeletonLoader width="90%" height={16} borderRadius={8} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  greetingSection: {
    marginBottom: 24,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '22%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

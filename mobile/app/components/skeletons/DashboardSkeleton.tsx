import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';
import colors from '../../theme/colors';

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View>
          <SkeletonLoader width={150} height={28} style={styles.mb8} />
          <SkeletonLoader width={200} height={16} />
        </View>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
      </View>

      {/* Stats Grid Skeleton */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.statCard}>
            <SkeletonLoader width={40} height={40} borderRadius={20} style={styles.mb12} />
            <SkeletonLoader width={60} height={24} style={styles.mb8} />
            <SkeletonLoader width={80} height={14} />
          </View>
        ))}
      </View>

      {/* Quick Actions Skeleton */}
      <View style={styles.section}>
        <SkeletonLoader width={120} height={20} style={styles.mb16} />
        <View style={styles.actionsGrid}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.actionCard}>
              <SkeletonLoader width={48} height={48} borderRadius={24} style={styles.mb12} />
              <SkeletonLoader width={100} height={16} style={styles.mb4} />
              <SkeletonLoader width={80} height={12} />
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity Skeleton */}
      <View style={styles.section}>
        <SkeletonLoader width={140} height={20} style={styles.mb16} />
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.activityCard}>
            <SkeletonLoader width={48} height={48} borderRadius={8} />
            <View style={styles.activityContent}>
              <SkeletonLoader width="70%" height={16} style={styles.mb8} />
              <SkeletonLoader width="50%" height={14} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 12,
  },
  mb16: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  section: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  activityContent: {
    flex: 1,
  },
});

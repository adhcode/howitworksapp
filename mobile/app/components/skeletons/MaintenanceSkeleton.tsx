import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

export const MaintenanceCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SkeletonLoader width="60%" height={18} />
          <SkeletonLoader width={60} height={24} borderRadius={12} />
        </View>
        <SkeletonLoader width={80} height={24} borderRadius={12} style={styles.mt8} />
      </View>
      
      {/* Description */}
      <SkeletonLoader width="100%" height={14} style={styles.mb4} />
      <SkeletonLoader width="80%" height={14} style={styles.mb12} />
      
      {/* Meta Info */}
      <View style={styles.metaRow}>
        <SkeletonLoader width={100} height={14} />
        <SkeletonLoader width={80} height={14} />
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <SkeletonLoader width={120} height={14} />
        <SkeletonLoader width={80} height={12} />
      </View>
    </View>
  );
};

export const MaintenanceListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MaintenanceCardSkeleton key={index} />
      ))}
    </>
  );
};

export const MaintenanceStatsSkeleton: React.FC = () => {
  return (
    <View style={styles.statsContainer}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.statCard}>
          <SkeletonLoader width={24} height={24} borderRadius={12} style={styles.mb8} />
          <SkeletonLoader width={40} height={20} style={styles.mb4} />
          <SkeletonLoader width={60} height={12} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mt8: {
    marginTop: 8,
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
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
});

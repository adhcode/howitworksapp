import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

export const TenantCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonLoader width={56} height={56} borderRadius={28} />
        <View style={styles.info}>
          <SkeletonLoader width="70%" height={18} style={styles.mb8} />
          <SkeletonLoader width="50%" height={14} style={styles.mb4} />
          <SkeletonLoader width="60%" height={14} />
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width="70%" height={14} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width="60%" height={14} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width="50%" height={14} />
        </View>
      </View>
      
      <View style={styles.footer}>
        <SkeletonLoader width={80} height={32} borderRadius={16} />
        <SkeletonLoader width={100} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

export const TenantListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TenantCardSkeleton key={index} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  info: {
    flex: 1,
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  details: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

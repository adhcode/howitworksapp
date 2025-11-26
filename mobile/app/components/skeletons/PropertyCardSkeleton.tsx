import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Image Skeleton */}
      <SkeletonLoader width="100%" height={180} borderRadius={12} style={styles.image} />
      
      {/* Content */}
      <View style={styles.content}>
        <SkeletonLoader width="80%" height={20} style={styles.mb8} />
        <SkeletonLoader width="60%" height={16} style={styles.mb12} />
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <SkeletonLoader width={60} height={14} />
          <SkeletonLoader width={60} height={14} />
          <SkeletonLoader width={60} height={14} />
        </View>
        
        {/* Price */}
        <View style={styles.priceRow}>
          <SkeletonLoader width={100} height={24} />
          <SkeletonLoader width={80} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
};

export const PropertyListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  image: {
    marginBottom: 0,
  },
  content: {
    padding: 16,
  },
  mb8: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

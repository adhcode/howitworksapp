import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

export const PropertyDetailsSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Image Skeleton */}
      <SkeletonLoader width="100%" height={250} style={styles.image} />

      {/* Header Section */}
      <View style={styles.section}>
        <SkeletonLoader width="70%" height={28} style={styles.title} />
        <SkeletonLoader width="50%" height={20} style={styles.subtitle} />
        <SkeletonLoader width="90%" height={18} style={styles.address} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.statCard}>
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <SkeletonLoader width="60%" height={20} style={styles.statText} />
            <SkeletonLoader width="80%" height={16} style={styles.statLabel} />
          </View>
        ))}
      </View>

      {/* Units Section */}
      <View style={styles.section}>
        <SkeletonLoader width="40%" height={24} style={styles.sectionTitle} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.unitCard}>
            <SkeletonLoader width="30%" height={20} style={styles.unitTitle} />
            <View style={styles.unitDetails}>
              <SkeletonLoader width="25%" height={16} />
              <SkeletonLoader width="25%" height={16} />
              <SkeletonLoader width="35%" height={16} />
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
  },
  image: {
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statText: {
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    marginBottom: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unitTitle: {
    marginBottom: 12,
  },
  unitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

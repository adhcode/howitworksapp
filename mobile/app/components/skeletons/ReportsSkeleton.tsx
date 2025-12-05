import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';
import colors from '../../theme/colors';

export const ReportsSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonLoader width={250} height={28} borderRadius={8} />
        <SkeletonLoader width="100%" height={16} borderRadius={8} style={{ marginTop: 8 }} />
        <SkeletonLoader width="80%" height={16} borderRadius={8} style={{ marginTop: 4 }} />
      </View>

      {/* Submit Button */}
      <SkeletonLoader width="100%" height={52} borderRadius={12} style={{ marginBottom: 32 }} />

      {/* Section Title */}
      <SkeletonLoader width={180} height={24} borderRadius={8} style={{ marginBottom: 16 }} />

      {/* Search Bar */}
      <SkeletonLoader width="100%" height={48} borderRadius={12} style={{ marginBottom: 20 }} />

      {/* Complaint Cards */}
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.card}>
          <View style={styles.cardHeader}>
            <SkeletonLoader width={180} height={18} borderRadius={8} />
            <SkeletonLoader width={80} height={24} borderRadius={12} />
          </View>
          <SkeletonLoader width={120} height={14} borderRadius={8} style={{ marginTop: 8 }} />
          <SkeletonLoader width={60} height={14} borderRadius={8} style={{ marginTop: 12 }} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

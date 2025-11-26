import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

export const FormSkeleton = ({ fieldCount = 6 }: { fieldCount?: number }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: fieldCount }).map((_, index) => (
        <View key={index} style={styles.fieldGroup}>
          <SkeletonLoader width="30%" height={16} style={styles.label} />
          <SkeletonLoader width="100%" height={50} borderRadius={12} />
        </View>
      ))}
      <SkeletonLoader width="100%" height={50} borderRadius={12} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  button: {
    marginTop: 20,
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

export const WalletBalanceSkeleton: React.FC = () => {
  return (
    <View style={styles.balanceCard}>
      <SkeletonLoader width={100} height={16} style={styles.mb12} />
      <SkeletonLoader width={200} height={40} style={styles.mb8} />
      <SkeletonLoader width={150} height={14} style={styles.mb20} />
      <SkeletonLoader width="100%" height={48} borderRadius={24} />
    </View>
  );
};

export const TransactionCardSkeleton: React.FC = () => {
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.transactionInfo}>
          <SkeletonLoader width={140} height={16} style={styles.mb6} />
          <SkeletonLoader width={100} height={14} />
        </View>
      </View>
      <View style={styles.transactionRight}>
        <SkeletonLoader width={90} height={18} style={styles.mb6} />
        <SkeletonLoader width={70} height={12} />
      </View>
    </View>
  );
};

export const TransactionListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.section}>
      <SkeletonLoader width={150} height={20} style={styles.mb16} />
      <View style={styles.historyCard}>
        {Array.from({ length: count }).map((_, index) => (
          <TransactionCardSkeleton key={index} />
        ))}
      </View>
    </View>
  );
};

export const WalletSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <SkeletonLoader width={120} height={28} style={styles.mb24} />
      
      {/* Balance Card */}
      <WalletBalanceSkeleton />
      
      {/* Transaction History */}
      <TransactionListSkeleton count={4} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  mb6: {
    marginBottom: 6,
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
  mb20: {
    marginBottom: 20,
  },
  mb24: {
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  section: {
    marginBottom: 24,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
});

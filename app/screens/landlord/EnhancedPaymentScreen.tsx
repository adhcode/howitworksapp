import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import colors from '../../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

const EnhancedPaymentScreen = () => {
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    walletBalance: 0,
    totalRentCollected: 0,
    upcomingPayments: 0,
    pendingPayments: 0,
    recentTransactions: [],
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLandlordPaymentStats();
      setPaymentData(response);
    } catch (error) {
      console.error('Error loading payment data:', error);
      // Use fallback data
      setPaymentData({
        walletBalance: 0,
        totalRentCollected: 0,
        upcomingPayments: 0,
        pendingPayments: 0,
        recentTransactions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondary}
            colors={[colors.secondary]}
          />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Wallet & Payments</Text>
            <Text style={styles.headerSubtitle}>
              Manage your rental income and transactions
            </Text>
          </View>

          {/* Wallet Balance Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletLabel}>Available Balance</Text>
              <MaterialIcons name="account-balance-wallet" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.walletAmount}>
              {formatCurrency(paymentData.walletBalance)}
            </Text>
            <TouchableOpacity style={styles.withdrawButton}>
              <MaterialIcons name="download" size={20} color="#fff" />
              <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Overview */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Payment Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewAmount}>
                  {formatCurrency(paymentData.totalRentCollected)}
                </Text>
                <Text style={styles.overviewLabel}>Total Collected</Text>
                <Text style={styles.overviewSubtext}>This year</Text>
              </View>

              <View style={styles.overviewCard}>
                <Text style={styles.overviewAmount}>
                  {paymentData.upcomingPayments}
                </Text>
                <Text style={styles.overviewLabel}>Upcoming</Text>
                <Text style={styles.overviewSubtext}>Next 7 days</Text>
              </View>

              <View style={styles.overviewCard}>
                <Text style={styles.overviewAmount}>
                  {formatCurrency(paymentData.pendingPayments)}
                </Text>
                <Text style={styles.overviewLabel}>Pending</Text>
                <Text style={styles.overviewSubtext}>Overdue</Text>
              </View>

              <View style={styles.overviewCard}>
                <Text style={styles.overviewAmount}>
                  {paymentData.recentTransactions.length}
                </Text>
                <Text style={styles.overviewLabel}>Transactions</Text>
                <Text style={styles.overviewSubtext}>This month</Text>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {paymentData.recentTransactions && paymentData.recentTransactions.length > 0 ? (
              paymentData.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <MaterialIcons 
                      name={transaction.type === 'credit' ? 'arrow-downward' : 'arrow-upward'} 
                      size={20} 
                      color={transaction.type === 'credit' ? '#10B981' : '#EF4444'} 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'credit' ? '#10B981' : '#EF4444' }
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your payment history will appear here
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.text,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  walletCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  walletAmount: {
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  overviewAmount: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  overviewSubtext: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default EnhancedPaymentScreen;
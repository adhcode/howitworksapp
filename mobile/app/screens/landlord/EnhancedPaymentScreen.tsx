import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import colors from '../../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { SkeletonLoader } from '../../components/skeletons/SkeletonLoader';

const EnhancedPaymentScreen = () => {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
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

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount > paymentData.walletBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance');
      return;
    }

    // Check if minimum withdrawal amount
    if (amount < 1000) {
      Alert.alert('Minimum Amount', 'Minimum withdrawal amount is ₦1,000');
      return;
    }

    try {
      setWithdrawing(true);
      await apiService.requestWithdrawal(amount, 'Wallet withdrawal');
      
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      
      Alert.alert(
        'Success!',
        'Withdrawal request submitted successfully. Funds will be transferred to your bank account.',
        [{ text: 'OK', onPress: () => loadPaymentData() }]
      );
    } catch (error: any) {
      // Check if it's a bank account error
      if (error.message?.includes('bank account')) {
        Alert.alert(
          'No Bank Account',
          'Please setup your bank account first to receive withdrawals.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Setup Now', 
              onPress: () => {
                setShowWithdrawModal(false);
                router.push('/landlord/setup-bank');
              }
            },
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to process withdrawal');
      }
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.content}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <SkeletonLoader width="60%" height={28} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="80%" height={16} />
          </View>

          {/* Wallet Card Skeleton */}
          <View style={styles.walletCard}>
            <SkeletonLoader width="40%" height={14} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="60%" height={32} style={{ marginBottom: 20 }} />
            <SkeletonLoader width="100%" height={44} borderRadius={8} />
          </View>

          {/* Overview Section Skeleton */}
          <SkeletonLoader width="40%" height={18} style={{ marginBottom: 16 }} />
          <View style={styles.overviewGrid}>
            <SkeletonLoader width="47%" height={100} borderRadius={12} />
            <SkeletonLoader width="47%" height={100} borderRadius={12} />
            <SkeletonLoader width="47%" height={100} borderRadius={12} />
            <SkeletonLoader width="47%" height={100} borderRadius={12} />
          </View>

          {/* Transactions Skeleton */}
          <View style={{ marginTop: 24 }}>
            <SkeletonLoader width="50%" height={18} style={{ marginBottom: 16 }} />
            <SkeletonLoader width="100%" height={72} style={{ marginBottom: 8 }} borderRadius={12} />
            <SkeletonLoader width="100%" height={72} style={{ marginBottom: 8 }} borderRadius={12} />
            <SkeletonLoader width="100%" height={72} borderRadius={12} />
          </View>
        </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
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
            <View style={styles.walletActions}>
              <TouchableOpacity 
                style={styles.withdrawButton}
                onPress={() => setShowWithdrawModal(true)}
              >
                <MaterialIcons name="download" size={20} color="#fff" />
                <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.transactionHistoryButton}
                onPress={() => router.push('/landlord/transaction-history')}
              >
                <MaterialIcons name="history" size={20} color={colors.secondary} />
                <Text style={styles.transactionHistoryButtonText}>History</Text>
              </TouchableOpacity>
            </View>
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
              <TouchableOpacity onPress={() => router.push('/landlord/transaction-history')}>
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

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setShowWithdrawModal(false);
            }}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Withdraw Funds</Text>
                <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                  <MaterialIcons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.availableBalanceText}>
                  Available: {formatCurrency(paymentData.walletBalance)}
                </Text>

                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholderTextColor="#999"
                />

                <View style={styles.quickAmounts}>
                  {[5000, 10000, 25000, 50000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.quickAmountButton}
                      onPress={() => setWithdrawAmount(amount.toString())}
                    >
                      <Text style={styles.quickAmountText}>₦{amount.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.minAmountText}>Minimum withdrawal: ₦1,000</Text>

                <TouchableOpacity
                  style={styles.setupBankButton}
                  onPress={() => {
                    setShowWithdrawModal(false);
                    router.push('/landlord/setup-bank');
                  }}
                >
                  <MaterialIcons name="account-balance" size={16} color={colors.secondary} />
                  <Text style={styles.setupBankButtonText}>Setup/Change Bank Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.withdrawModalButton,
                    withdrawing && styles.withdrawModalButtonDisabled,
                  ]}
                  onPress={handleWithdraw}
                  disabled={withdrawing}
                >
                  <Text style={styles.withdrawModalButtonText}>
                    {withdrawing ? 'Processing...' : 'Withdraw to Bank Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 0,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
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
    padding: 20,
    marginBottom: 16,
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
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  withdrawButton: {
    flex: 2,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  withdrawButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  transactionHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: 6,
  },
  transactionHistoryButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
  overviewSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 12,
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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  modalBody: {
    padding: 20,
  },
  availableBalanceText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  amountInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
  },
  minAmountText: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  withdrawModalButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  withdrawModalButtonDisabled: {
    opacity: 0.6,
  },
  withdrawModalButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  setupBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: 8,
    marginBottom: 12,
  },
  setupBankButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
});

export default EnhancedPaymentScreen;
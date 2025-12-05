import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import { SkeletonLoader } from '../components/skeletons/SkeletonLoader';

export default function WalletScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);

  const balanceAnimation = new Animated.Value(0);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionsData] = await Promise.all([
        apiService.getWalletBalance(),
        apiService.getWalletTransactions({ limit: 50 }),
      ]);

      setBalance(walletData.balance || 0);
      setTransactions(transactionsData.transactions || []);

      // Animate balance
      Animated.spring(balanceAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } catch (error: any) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance');
      return;
    }

    if (!hasBankAccount) {
      Alert.alert(
        'No Bank Account',
        'Please setup your bank account first',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Setup Now', onPress: () => router.push('/landlord/setup-bank') },
        ]
      );
      return;
    }

    try {
      setWithdrawing(true);
      await apiService.requestWithdrawal(amount, 'Wallet withdrawal');
      
      Alert.alert(
        'Success',
        'Withdrawal request submitted successfully. Funds will be transferred to your bank account.',
        [{ text: 'OK', onPress: () => {
          setShowWithdrawModal(false);
          setWithdrawAmount('');
          loadWalletData();
        }}]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'rent_payment':
        return 'arrow-downward';
      case 'debit':
      case 'withdrawal':
        return 'arrow-upward';
      default:
        return 'swap-horiz';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'rent_payment':
        return '#34C759';
      case 'debit':
      case 'withdrawal':
        return '#FF3B30';
      default:
        return colors.secondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <SkeletonLoader width="100%" height={180} style={{ marginBottom: 24 }} />
          <SkeletonLoader width="100%" height={80} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={80} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={80} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={() => router.push('/landlord/setup-bank')}>
            <MaterialIcons name="account-balance" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Balance Card */}
          <Animated.View
            style={[
              styles.balanceCard,
              {
                opacity: balanceAnimation,
                transform: [{
                  scale: balanceAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }],
              },
            ]}
          >
            <View style={styles.balanceHeader}>
              <MaterialIcons name="account-balance-wallet" size={32} color="#fff" />
              <View style={styles.balanceBadge}>
                <MaterialIcons name="verified" size={16} color="#fff" />
                <Text style={styles.balanceBadgeText}>Active</Text>
              </View>
            </View>

            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>

            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={styles.balanceButton}
                onPress={() => setShowWithdrawModal(true)}
              >
                <MaterialIcons name="arrow-upward" size={20} color="#fff" />
                <Text style={styles.balanceButtonText}>Withdraw</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.balanceButton, styles.balanceButtonSecondary]}
                onPress={() => router.push('/landlord/transaction-history')}
              >
                <MaterialIcons name="history" size={20} color={colors.secondary} />
                <Text style={[styles.balanceButtonText, styles.balanceButtonTextSecondary]}>
                  History
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="trending-up" size={24} color="#34C759" />
              <Text style={styles.statValue}>{transactions.filter(t => t.type === 'credit').length}</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="trending-down" size={24} color="#FF3B30" />
              <Text style={styles.statValue}>{transactions.filter(t => t.type === 'debit').length}</Text>
              <Text style={styles.statLabel}>Withdrawals</Text>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push('/landlord/transaction-history')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {transactions.length > 0 ? (
              transactions.slice(0, 10).map((transaction, index) => (
                <View key={index} style={styles.transactionCard}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: `${getTransactionColor(transaction.type)}15` }
                  ]}>
                    <MaterialIcons
                      name={getTransactionIcon(transaction.type)}
                      size={20}
                      color={getTransactionColor(transaction.type)}
                    />
                  </View>

                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>
                      {transaction.description || transaction.type}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) }
                    ]}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your transaction history will appear here
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.availableBalanceText}>
                Available: {formatCurrency(balance)}
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

              <TouchableOpacity
                style={[
                  styles.withdrawButton,
                  withdrawing && styles.withdrawButtonDisabled,
                ]}
                onPress={handleWithdraw}
                disabled={withdrawing}
              >
                <Text style={styles.withdrawButtonText}>
                  {withdrawing ? 'Processing...' : 'Withdraw'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  balanceBadgeText: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: '#fff',
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: 'Outfit_700Bold',
    color: '#fff',
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  balanceButtonSecondary: {
    backgroundColor: '#fff',
  },
  balanceButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  balanceButtonTextSecondary: {
    color: colors.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginTop: 4,
  },
  transactionsSection: {
    marginBottom: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#CCC',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
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
    marginBottom: 24,
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
  withdrawButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});

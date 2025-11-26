import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PaystackPayment from '../../components/PaystackPayment';
import { WalletSkeleton } from '../../components/skeletons';

const TenantWalletScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPaystack, setShowPaystack] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTenantPayments();
      console.log('Payment data loaded:', response);
      console.log('Due date:', response?.dueDate);
      setPaymentData(response);
    } catch (error: any) {
      console.error('Error loading payment data:', error);
      // You could show an error state here instead of mock data
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

    const formatDueDate = (dateString: string) => {
    if (!dateString || dateString === 'No payments due') {
      return dateString || 'No due date available';
    }

    try {
      // If it's already formatted, return as is
      if (dateString.includes(',') || dateString.includes('No payments due')) {
        return dateString;
      }

      // Try to parse and format the date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handlePayment = () => {
    if (paymentData?.totalDue > 0) {
      setShowPaystack(true);
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    console.log('Payment successful:', reference);
    // Reload payment data to reflect the payment
    loadPaymentData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <WalletSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Wallet</Text>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Due</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(paymentData?.totalDue || 0)}
            </Text>
            <Text style={styles.dueDate}>
              Due: {formatDueDate(paymentData?.dueDate)}
            </Text>

            <TouchableOpacity
              style={[styles.payButton, paymentData?.totalDue <= 0 && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={paymentData?.totalDue <= 0}
            >
              <Text style={styles.payButtonText}>Make Payment</Text>
            </TouchableOpacity>
          </View>

          {/* Payment History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.historyCard}>
              <Text style={styles.noHistoryText}>No payment history available</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Paystack Payment Modal */}
      <PaystackPayment
        visible={showPaystack}
        onClose={() => setShowPaystack(false)}
        onSuccess={handlePaymentSuccess}
        amount={paymentData?.totalDue || 0}
        email={user?.email || ''}
        description="Monthly rent payment"
        metadata={{
          userId: user?.id,
          propertyId: paymentData?.propertyId,
          tenantId: user?.id,
        }}
      />
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
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 24,
  },
  balanceCard: {
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
  balanceLabel: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.textGray,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.textGray,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.text,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  noHistoryText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
});

export default TenantWalletScreen;
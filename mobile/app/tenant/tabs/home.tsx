import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import TenantGreetingHeader from '../../components/tenant/TenantGreetingHeader';
import TenantPaymentCard from '../../components/tenant/TenantPaymentCard';
import TenantQuickActions from '../../components/tenant/TenantQuickActions';
import { TenantHomeSkeleton } from '../../components/skeletons';

interface TenantData {
  property: {
    name: string;
    unit: string;
  };
  totalDue: number;
  dueDate: string;
  tenant: {
    firstName: string;
    lastName: string;
  };
}

const TenantHomeScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      setError(null);
      const data = await apiService.getTenantData();
      setTenantData(data);
    } catch (error: any) {
      console.error('Failed to load tenant data:', error);
      setError(error.message || 'Failed to load tenant data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenantData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No due date';

    // If it's already a formatted string like "August 20, 2025" or "No payments due", return as is
    if (dateString.includes('No payments due') || dateString.match(/^[A-Za-z]+ \d{1,2}, \d{4}$/)) {
      return dateString;
    }

    // Otherwise, try to parse as ISO date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if can't parse

    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TenantHomeSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load tenant data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tenantData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No tenant data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TenantGreetingHeader
        user={user}
        tenantData={tenantData}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Payment Card */}
          <TenantPaymentCard
            data={tenantData}
            loading={false}
          />

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Property</Text>
                <Text style={styles.summaryValue}>{tenantData.property.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Due</Text>
                <Text style={styles.summaryValue}>{formatCurrency(tenantData.totalDue || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Due Date</Text>
                <Text style={styles.summaryValue}>
                  {tenantData.dueDate ? formatDate(tenantData.dueDate) : 'No due date set'}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <TenantQuickActions />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  summarySection: {
    marginTop: 32,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.text,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
  },
  balanceValue: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
});

export default TenantHomeScreen;
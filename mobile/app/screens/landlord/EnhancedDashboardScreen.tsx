import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { DashboardSkeleton } from '../../components/skeletons';
import colors from '../../theme/colors';
import GreetingHeader from '../../components/landlord/GreetingHeader';
import QuickActions from '../../components/landlord/QuickActions';

const EnhancedDashboardScreen = () => {
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPayments, setGeneratingPayments] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState({
    propertiesManaged: 0,
    fullyOccupied: 0,
    activeTenants: 0,
    pendingVerification: 0,
    rentCollected: 0,
    rentCollectedDate: '',
    upcomingPayments: 0,
    upcomingPaymentsCombined: 0,
    outstandingRent: 0,
    outstandingRentTenants: 0,
    activeReports: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get actual dashboard data from backend
      const response = await apiService.getLandlordDashboard();
      setDashboardData(response);
    } catch (error) {
      console.error('Frontend: Error loading dashboard data:', error);
      // Only use minimal fallback data when API is completely unavailable
      setDashboardData({
        propertiesManaged: 0,
        fullyOccupied: 0,
        activeTenants: 0,
        pendingVerification: 0,
        rentCollected: 0,
        rentCollectedDate: 'N/A',
        upcomingPayments: 0,
        upcomingPaymentsCombined: 0,
        outstandingRent: 0,
        outstandingRentTenants: 0,
        activeReports: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const generatePaymentSchedules = async () => {
    try {
      setGeneratingPayments(true);
      await apiService.generatePaymentSchedules();
      await loadDashboardData(); // Refresh data after generating
    } catch (error) {
      console.error('Error generating payment schedules:', error);
    } finally {
      setGeneratingPayments(false);
    }
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DashboardSkeleton />
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
          {/* Greeting Header */}
          <GreetingHeader />

          {/* Summary Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Summary of your properties and rental activities.
            </Text>
          </View>

          {/* Dashboard Grid */}
          <View style={styles.grid}>
            {/* Properties Managed */}
            <View style={styles.card}>
              <Text style={styles.cardNumber}>{(dashboardData.propertiesManaged || 0).toString().padStart(2, '0')}</Text>
              <Text style={styles.cardTitle}>Properties Managed</Text>
              <Text style={styles.cardSubtitle}>{dashboardData.fullyOccupied || 0} fully occupied</Text>
            </View>

            {/* Active Tenants */}
            <View style={styles.card}>
              <Text style={styles.cardNumber}>{(dashboardData.activeTenants || 0).toString().padStart(2, '0')}</Text>
              <Text style={styles.cardTitle}>Active Tenants</Text>
              <Text style={styles.cardSubtitle}>{dashboardData.pendingVerification || 0} pending verification</Text>
            </View>

            {/* Rent Collected */}
            <View style={styles.card}>
              <Text style={styles.cardNumber}>{formatCurrency(dashboardData.rentCollected || 0)}</Text>
              <Text style={styles.cardTitle}>Rent Collected (This Year)</Text>
              <Text style={styles.cardSubtitle}>As of {dashboardData.rentCollectedDate || 'N/A'}</Text>
            </View>

            {/* Upcoming Payments */}
            <View style={styles.card}>
              <Text style={styles.cardNumber}>{dashboardData.upcomingPayments || 0} Due in 7 days</Text>
              <Text style={styles.cardTitle}>Upcoming Payments</Text>
              <Text style={styles.cardSubtitle}>{formatCurrency(dashboardData.upcomingPaymentsCombined || 0)} combined</Text>
            </View>

            {/* Outstanding Rent */}
            <View style={styles.card}>
              <Text style={styles.cardNumber}>{formatCurrency(dashboardData.outstandingRent || 0)}</Text>
              <Text style={styles.cardTitle}>Total Outstanding Rent</Text>
              <Text style={styles.cardSubtitle}>From {dashboardData.outstandingRentTenants || 0} tenants</Text>
            </View>

            {/* Active Reports */}
            <View style={styles.card}>
              <Text style={styles.cardNumber}>{dashboardData.activeReports || 0} Active Reports</Text>
              <Text style={styles.cardTitle}>Open Reports</Text>
              <Text style={styles.cardSubtitle}></Text>
            </View>
          </View>

          {/* Quick Actions */}
          <QuickActions />

          
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
    padding: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    
  },
  cardNumber: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
    lineHeight: 18,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 16,
  },
 
  
});

export default EnhancedDashboardScreen;
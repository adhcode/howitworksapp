import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  RefreshControl, 
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import TenantGreetingHeader from '../../components/tenant/TenantGreetingHeader';
import TenantPaymentCard from '../../components/tenant/TenantPaymentCard';
import TenantQuickActions from '../../components/tenant/TenantQuickActions';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

const TenantDashboardScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<any>(null);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Animate dashboard on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load tenant data
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      
      // Try to get actual tenant data from backend
      try {
        const response = await apiService.getTenantData();
        setTenantData(response);
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError);
        // Fallback to mock data if API is not available
        setTenantData({
          property: {
            name: 'Ikoyi Palm Court',
            unit: 'Unit B3',
          },
          totalDue: 750000,
          dueDate: 'May 30, 2025',
          tenant: {
            firstName: user?.firstName || 'Mr. Adewale',
            lastName: user?.lastName || 'Johnson',
          }
        });
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenantData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TenantGreetingHeader user={user} tenantData={tenantData} />
            <TenantPaymentCard data={tenantData} loading={loading} />
            <TenantQuickActions />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
});

export default TenantDashboardScreen;
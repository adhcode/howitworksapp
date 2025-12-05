import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import { apiService } from '../services/api';
import { TenantListSkeleton } from '../components/skeletons';

const TenantListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const propertyName = params.propertyName as string;

  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTenants();
  }, [propertyId]);

  const loadTenants = async () => {
    try {
      const response = await apiService.getTenantsByLandlord();
      const allTenants = Array.isArray(response) ? response : (response.data || []);
      
      // Filter tenants for this property
      const propertyTenants = allTenants.filter((tenant: any) => tenant.propertyId === propertyId);
      setTenants(propertyTenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenants();
    setRefreshing(false);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={propertyName || 'Tenants'} 
          showBack={true} 
          onBack={() => router.push('/landlord/tabs/tenants')}
        />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <TenantListSkeleton count={3} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={propertyName || 'Tenants'} 
        showBack={true} 
        onBack={() => router.push('/landlord/tabs/tenants')}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Tenants</Text>
            <Text style={styles.summaryValue}>{tenants.length}</Text>
            <Text style={styles.summarySubtext}>
              {tenants.filter(t => t.status === 'accepted').length} active
            </Text>
          </View>

          {/* Tenant List */}
          {tenants.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyStateTitle}>No Tenants Yet</Text>
              <Text style={styles.emptyStateText}>
                Add tenants to this property to see them here
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push(`/landlord/add-tenant?propertyId=${propertyId}`)}
              >
                <MaterialIcons name="person-add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Tenant</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tenantsList}>
              {tenants.map((tenant) => (
                <View key={tenant.id} style={styles.tenantCard}>
                  <View style={styles.tenantHeader}>
                    <View style={styles.tenantAvatar}>
                      <Text style={styles.tenantInitials}>
                        {tenant.firstName?.[0]}{tenant.lastName?.[0]}
                      </Text>
                    </View>
                    <View style={styles.tenantInfo}>
                      <Text style={styles.tenantName}>
                        {tenant.firstName} {tenant.lastName}
                      </Text>
                      <Text style={styles.tenantEmail}>{tenant.email}</Text>
                      <Text style={styles.tenantPhone}>{tenant.phone}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      tenant.status === 'accepted' && styles.statusActive
                    ]}>
                      <Text style={styles.statusText}>
                        {tenant.status === 'accepted' ? 'Active' : tenant.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tenantDetails}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="home" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Unit:</Text>
                      <Text style={styles.detailValue}>{tenant.unit?.unitNumber || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="attach-money" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Rent:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(tenant.monthlyRent)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="calendar-today" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Lease:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 48,
    fontFamily: 'Outfit_700Bold',
    color: '#fff',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#fff',
    opacity: 0.9,
  },
  tenantsList: {
    gap: 12,
  },
  tenantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tenantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tenantInitials: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  tenantEmail: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 2,
  },
  tenantPhone: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  statusActive: {
    backgroundColor: '#40B86915',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: '#40B869',
  },
  tenantDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});

export default TenantListScreen;
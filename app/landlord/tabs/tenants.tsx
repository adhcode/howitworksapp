import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TenantManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProperties();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProperties();
    }, [])
  );

  const loadProperties = async () => {
    try {
      setError(null);
      const response = await apiService.getProperties(1, 50);

      if (!response.data || response.data.length === 0) {
        setProperties([]);
        return;
      }

      const propertiesWithTenants = await Promise.all(
        response.data.map(async (property) => {
          try {
            // Get property with units
            const propertyWithUnits = await apiService.getPropertyWithUnits(property.id);
            const units = propertyWithUnits.units || [];

            // Get tenants for this property
            const tenantsResponse = await apiService.getTenantsByLandlord().catch(() => ({ data: [] })) as any;
            const propertyTenants = tenantsResponse.data?.filter((tenant: any) => tenant.propertyId === property.id) || [];

            // Calculate tenant stats
            const totalTenants = propertyTenants.length;
            const activeTenants = propertyTenants.filter((tenant: any) => tenant.status === 'accepted').length;
            const occupiedUnits = units.filter((unit: any) => !unit.isAvailable).length;
            const vacantUnits = units.filter((unit: any) => unit.isAvailable).length;

            // Calculate total monthly rent from tenants
            const monthlyRent = propertyTenants.reduce((total: number, tenant: any) => {
              return total + (parseFloat(tenant.monthlyRent) || 0);
            }, 0);

            return {
              ...property,
              totalTenants,
              activeTenants,
              occupiedUnits,
              vacantUnits,
              monthlyRent,
              tenants: propertyTenants,
            };
          } catch (error) {
            console.error(`Error loading tenants for property ${property.id}:`, error);
            return {
              ...property,
              totalTenants: 0,
              activeTenants: 0,
              occupiedUnits: 0,
              vacantUnits: property.totalUnits,
              monthlyRent: 0,
              tenants: [],
            };
          }
        })
      );

      setProperties(propertiesWithTenants);
    } catch (error: any) {
      console.error('Error loading properties:', error);
      setError(error.message || 'Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handleAddTenant = (propertyId: string) => {
    router.push(`/landlord/add-tenant?propertyId=${propertyId}`);
  };

  const handlePropertyPress = (property: any) => {
    // Navigate to tenant list for this property
    router.push(`/landlord/tenant-list?propertyId=${property.id}&propertyName=${encodeURIComponent(property.name)}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalStats = () => {
    const totalTenants = properties.reduce((sum, prop) => sum + prop.totalTenants, 0);
    const totalActive = properties.reduce((sum, prop) => sum + prop.activeTenants, 0);
    const totalRent = properties.reduce((sum, prop) => sum + prop.monthlyRent, 0);
    const totalProperties = properties.length;

    return { totalTenants, totalActive, totalRent, totalProperties };
  };

  const totalStats = getTotalStats();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tenant data...</Text>
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
            <Text style={styles.title}>Tenant Management</Text>
            <Text style={styles.subtitle}>Manage tenants across all your properties</Text>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsOverview}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <MaterialIcons name="people" size={24} color={colors.secondary} />
                <Text style={styles.statValue}>{totalStats.totalTenants}</Text>
                <Text style={styles.statLabel}>Total Tenants</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="check-circle" size={24} color="#40B869" />
                <Text style={styles.statValue}>{totalStats.totalActive}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <MaterialIcons name="home-work" size={24} color="#FF9800" />
                <Text style={styles.statValue}>{totalStats.totalProperties}</Text>
                <Text style={styles.statLabel}>Properties</Text>z
              </View>
              <View style={styles.statCard}>
                <Text style={styles.nairaIconLarge}>₦</Text>
                <Text style={styles.statValue}>{Math.round(totalStats.totalRent).toLocaleString()}</Text>
                <Text style={styles.statLabel}>Monthly Rent</Text>
              </View>
            </View>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={24} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadProperties}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Properties Section */}
          <View style={styles.propertiesSection}>
            <Text style={styles.sectionTitle}>Properties with Tenants ({properties.length})</Text>

            {!error && properties.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="home-work" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateTitle}>No Properties Yet</Text>
                <Text style={styles.emptyStateText}>
                  Add properties first to manage tenants
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/landlord/add-property')}
                >
                  <Text style={styles.emptyStateButtonText}>Add Property</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.propertiesList}>
                {properties.map((property) => (
                  <View key={property.id} style={styles.propertyCard}>
                    {/* Property Image */}
                    <TouchableOpacity
                      style={styles.propertyImageContainer}
                      onPress={() => handlePropertyPress(property)}
                      activeOpacity={0.7}
                    >
                      {property.images && property.images.length > 0 && !imageErrors.has(property.id) ? (
                        <Image
                          source={{ uri: property.images[0] }}
                          style={styles.propertyImage}
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(property.id));
                          }}
                        />
                      ) : (
                        <Image
                          source={require('../../assets/images/house.png')}
                          style={styles.propertyImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.imageOverlay}>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>
                            {property.totalTenants > 0 ? 'Has Tenants' : 'No Tenants'}
                          </Text>
                        </View>
                        {property.totalTenants > 0 && (
                          <View style={styles.tenantCount}>
                            <MaterialIcons name="people" size={12} color="#fff" />
                            <Text style={styles.tenantCountText}>{property.totalTenants}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    <View style={styles.propertyContent}>
                      <TouchableOpacity
                        style={styles.propertyHeader}
                        onPress={() => handlePropertyPress(property)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.propertyName}>{property.name}</Text>
                      </TouchableOpacity>

                      <View style={styles.propertyAddress}>
                        <MaterialIcons name="location-on" size={16} color="#666666" />
                        <Text style={styles.addressText}>
                          {property.address}, {property.city}
                        </Text>
                      </View>

                      <View style={styles.propertyStats}>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{property.totalTenants}</Text>
                          <Text style={styles.statLabel}>Tenants</Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{property.activeTenants}</Text>
                          <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{property.occupiedUnits}</Text>
                          <Text style={styles.statLabel}>Occupied</Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>
                            {formatCurrency(property.monthlyRent)}
                          </Text>
                          <Text style={styles.statLabel}>Monthly Rent</Text>
                        </View>
                      </View>

                      {/* Add Tenant Button for this property */}
                      <TouchableOpacity
                        style={styles.addTenantButton}
                        onPress={() => handleAddTenant(property.id)}
                      >
                        <MaterialIcons name="person-add" size={16} color={colors.secondary} />
                        <Text style={styles.addTenantButtonText}>Add Tenant to {property.name}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    padding: 20,
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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  statsOverview: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  propertiesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 16,
  },
  propertiesList: {
    gap: 16,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  propertyImageContainer: {
    position: 'relative',
    height: 160,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
    marginTop: 4,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tenantCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tenantCountText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
  },
  propertyContent: {
    padding: 20,
  },
  propertyHeader: {
    marginBottom: 12,
  },
  propertyName: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#40B86915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: '#40B869',
  },
  propertyAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    marginLeft: 4,
    flex: 1,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  addTenantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.secondary}10`,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  addTenantButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
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
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#FF6B6B',
    textAlign: 'center',
    marginVertical: 12,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  nairaIconLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
}); 
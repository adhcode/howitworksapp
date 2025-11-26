import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Property } from '../../types/api';
import apiService from '../../services/api';
import colors from '../../theme/colors';
import { PropertyListSkeleton } from '../../components/skeletons';

const PropertyScreen = () => {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && token) {
      loadProperties();
    } else if (!authLoading && !token) {
      setError('You need to be logged in to view properties');
      setLoading(false);
    }
  }, [authLoading, token]);

  // Refresh properties when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        // Clear all property-related caches when screen comes into focus
        apiService.clearCache('properties');
        loadProperties();
      }
    }, [token])
  );

  const loadProperties = async () => {
    try {
      setError(null);

      // Clear cache to ensure fresh data
      apiService.clearCache('properties');

      const response = await apiService.getProperties(1, 50);

      if (!response) {
        setProperties([]);
        return;
      }

      // Handle different response formats
      let propertiesData: Property[] = [];
      if (response.data && Array.isArray(response.data)) {
        propertiesData = response.data as Property[];
      } else if (Array.isArray(response)) {
        propertiesData = response as Property[];
      } else {
        propertiesData = [];
      }

      if (propertiesData.length === 0) {
        setProperties([]);
        return;
      }

      const propertiesWithStats = await Promise.all(
        propertiesData.map(async (property) => {
          try {
            // Get property with units to calculate occupancy and rent
            // Clear specific property cache before fetching
            apiService.clearCache(`properties/${property.id}`);
            const propertyWithUnits = await apiService.getPropertyWithUnits(property.id);
            const units = propertyWithUnits.units || [];

            // Calculate occupancy stats
            const occupiedUnits = units.filter((unit: any) => !unit.isAvailable).length;
            const vacantUnits = units.filter((unit: any) => unit.isAvailable).length;

            // Calculate total monthly rent from all units
            const monthlyRent = units.reduce((total: number, unit: any) => {
              const rent = parseFloat(unit.rent || 0);
              return total + rent;
            }, 0);

            return {
              ...property,
              occupiedUnits,
              vacantUnits,
              monthlyRent,
            };
          } catch (error) {
            console.error(`Error loading units for property ${property.id}:`, error);
            // Return property with default values if units can't be loaded
            return {
              ...property,
              occupiedUnits: 0,
              vacantUnits: property.totalUnits || 0,
              monthlyRent: 0,
            };
          }
        })
      );

      setProperties(propertiesWithStats);
    } catch (error: any) {
      console.error('Error loading properties:', error);

      // Handle specific error cases
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        setError('Authentication expired. Please log in again.');
      } else if (error.message?.includes('Network request failed')) {
        setError('Network error. Please check your connection and make sure the backend is running.');
      } else if (error.message?.includes('timeout')) {
        setError('Request timeout. Please try again.');
      } else {
        setError(error.message || 'Failed to load properties');
      }

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

  const handleAddProperty = () => {
    router.push('/landlord/add-property?from=property');
  };

  const handlePropertyPress = (property: Property) => {
    router.push(`/landlord/property-details?id=${property.id}`);
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading state while checking authentication
  if (authLoading || (loading && !error)) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Property Management</Text>
              <Text style={styles.subtitle}>
                Manage all your listed properties
              </Text>
            </View>
            <PropertyListSkeleton count={3} />
          </View>
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Property Management</Text>
            <Text style={styles.subtitle}>
              Manage all your listed properties
            </Text>
          </View>

          {/* Add Property Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add New Property</Text>
          </TouchableOpacity>

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

          {/* Properties List */}
          <View style={styles.propertiesSection}>
            <Text style={styles.sectionTitle}>Your Properties ({properties.length})</Text>

            {!error && properties.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="home" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateTitle}>No Properties Yet</Text>
                <Text style={styles.emptyStateText}>
                  Start by adding your first property to manage tenants and collect rent
                </Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddProperty}>
                  <Text style={styles.emptyStateButtonText}>Add Property</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.propertiesList}>
                {properties.map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={styles.propertyCard}
                    onPress={() => handlePropertyPress(property)}
                    activeOpacity={0.7}
                  >
                    {/* Property Image */}
                    <View style={styles.propertyImageContainer}>
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
                            {property.status === 'active' ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        {property.images && property.images.length > 1 && (
                          <View style={styles.imageCount}>
                            <MaterialIcons name="photo-library" size={12} color="#fff" />
                            <Text style={styles.imageCountText}>{property.images.length}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.propertyContent}>
                      <View style={styles.propertyHeader}>
                        <Text style={styles.propertyName}>{property.name}</Text>
                      </View>

                      <View style={styles.propertyAddress}>
                        <MaterialIcons name="location-on" size={16} color="#666666" />
                        <Text style={styles.addressText}>
                          {property.address}, {property.city}
                        </Text>
                      </View>

                      <View style={styles.propertyStats}>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{property.totalUnits || 0}</Text>
                          <Text style={styles.statLabel}>Units</Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{property.occupiedUnits || 0}</Text>
                          <Text style={styles.statLabel}>Occupied</Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{property.vacantUnits || property.totalUnits || 0}</Text>
                          <Text style={styles.statLabel}>Vacant</Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>
                            {formatCurrency(property.monthlyRent || 0)}
                          </Text>
                          <Text style={styles.statLabel}>Monthly Rent</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.text,
    textAlign: 'center',
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
  addButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
    marginLeft: 8,
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
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  imageCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCountText: {
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
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    textAlign: 'center',
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
    lineHeight: 24,
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
});

export default PropertyScreen; 
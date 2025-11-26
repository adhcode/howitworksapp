import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Property } from '../types/api';
import apiService from '../services/api';
import Header from '../components/Header';
import CustomAlert from '../components/CustomAlert';
import colors from '../theme/colors';
import { PropertyDetailsSkeleton } from '../components/skeletons';

const { width } = Dimensions.get('window');

const PropertyDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!propertyId) {
      console.error('No property ID provided');
      showAlert('error', 'Invalid Property', 'No property ID was provided. Please try again.');
      setLoading(false);
      return;
    }

    loadPropertyDetails();

    // Animate on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [propertyId]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const loadPropertyDetails = async () => {
    setLoading(true);

    try {
      // Clear cache to ensure fresh data
      apiService.clearCache(`properties/${propertyId}`);
      const propertyData = await apiService.getPropertyWithUnits(propertyId);

      // Debug: Check if we have units and their rent values
      if (propertyData.units && propertyData.units.length > 0) {
        console.log('✅ Found units:', propertyData.units.length);
        propertyData.units.forEach(unit => {
          console.log(`Unit ${unit.unitNumber}: rent=${unit.rent} (${typeof unit.rent})`);
        });
      } else {
        console.log('❌ No units found for this property');
      }

      setProperty(propertyData);
      setUnits(propertyData.units || []);
    } catch (error: any) {
      console.error('Error loading property details:', error);
      showAlert('error', 'Failed to Load Property', error.message || 'Unable to load property details. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };




  const handleBack = () => {
    // Navigate back to property list - use replace to prevent iOS swipe back issues
    router.replace('/landlord/tabs/property');
  };

  // Refresh data when screen comes into focus (e.g., returning from add unit screen)
  useFocusEffect(
    React.useCallback(() => {
      // Reload property details and units when screen comes into focus
      if (propertyId) {
        loadPropertyDetails();
      }
      return () => {
        // Cleanup function - runs when screen loses focus
      };
    }, [propertyId])
  );

  const handleEditProperty = () => {
    router.push(`/landlord/edit-property?id=${propertyId}`);
  };

  const handleAddUnit = () => {
    router.push(`/landlord/add-unit?propertyId=${propertyId}`);
  };

  const handleAddTenant = () => {
    router.push(`/landlord/add-tenant?propertyId=${propertyId}`);
  };

  const handleUnitPress = (unit: any) => {
    router.push(`/landlord/unit-details?id=${unit.id}&propertyId=${propertyId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPropertyStats = () => {
    const occupied = units.filter(unit => !unit.isAvailable).length;
    const vacant = units.filter(unit => unit.isAvailable).length;
    const occupancyRate = units.length > 0 ? (occupied / units.length) * 100 : 0;

    // Calculate monthly revenue from all units (accumulated rent)
    // Convert rent from string (decimal) to number for calculation
    const monthlyRevenue = units.reduce((total, unit) => {
      const rent = parseFloat(unit.rent) || 0;
      return total + rent;
    }, 0);

    // Calculate actual revenue from occupied units only
    const actualRevenue = units
      .filter(unit => !unit.isAvailable) // Only occupied units generate actual revenue
      .reduce((total, unit) => {
        const rent = parseFloat(unit.rent) || 0;
        return total + rent;
      }, 0);

    return {
      occupied,
      vacant,
      occupancyRate,
      monthlyRevenue,
      actualRevenue
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Property Details" showBack={true} onBack={handleBack} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PropertyDetailsSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Property Details" showBack={true} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#E0E0E0" />
          <Text style={styles.errorText}>Property not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPropertyDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getPropertyStats();



  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Property Details"
        showBack={true}
        onBack={handleBack}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProperty}>
          <MaterialIcons name="edit" size={18} color={colors.secondary} />
          <Text style={styles.actionButtonText}>Edit Property</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleAddUnit}>
          <MaterialIcons name="add-home" size={18} color={colors.secondary} />
          <Text style={styles.actionButtonText}>Add Unit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleAddTenant}>
          <MaterialIcons name="person-add" size={18} color={colors.secondary} />
          <Text style={styles.actionButtonText}>Add Tenant</Text>
        </TouchableOpacity>
      </View>





      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {property && (
          <View style={styles.content}>
            {/* Simple property info at top */}


            {/* Property Images */}
            {property.images && property.images.length > 0 && (
              <View style={styles.imageContainer}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentImageIndex(index);
                  }}
                >
                  {property.images.map((image, index) => (
                    imageErrors.has(index) ? (
                      <View key={index} style={[styles.propertyImage, styles.imagePlaceholder]}>
                        <MaterialIcons name="broken-image" size={48} color="#ccc" />
                        <Text style={styles.imagePlaceholderText}>Image not available</Text>
                      </View>
                    ) : (
                      <Image
                        key={index}
                        source={{ uri: image }}
                        style={styles.propertyImage}
                        onError={() => {
                          setImageErrors(prev => new Set(prev).add(index));
                        }}
                      />
                    )
                  ))}
                </ScrollView>

                {property.images.length > 1 && (
                  <View style={styles.imageIndicators}>
                    {property.images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicator,
                          { backgroundColor: index === currentImageIndex ? colors.secondary : 'rgba(255,255,255,0.5)' }
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Property Header */}
            <View style={styles.propertyHeader}>
              <View style={styles.propertyTitleContainer}>
                <Text style={styles.propertyName}>{property.name}</Text>
                <View style={styles.propertyTypeContainer}>
                  <MaterialIcons
                    name={property.propertyType === 'apartment' ? 'apartment' : 'home'}
                    size={16}
                    color={colors.secondary}
                  />
                  <Text style={styles.propertyType}>
                    {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: property.status === 'active' ? '#40B86915' : '#FF980015' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: property.status === 'active' ? '#40B869' : '#FF9800' }
                ]}>
                  {property.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            {/* Address */}
            <View style={styles.addressContainer}>
              <MaterialIcons name="location-on" size={20} color="#666666" />
              <Text style={styles.address}>
                {property.address}, {property.city}, {property.state}
              </Text>
            </View>

            {/* Description */}
            {property.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{property.description}</Text>
              </View>
            )}

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <MaterialIcons name="home" size={24} color={colors.secondary} />
                  <Text style={styles.statValue}>{property.totalUnits}</Text>
                  <Text style={styles.statLabel}>Total Units</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="people" size={24} color="#40B869" />
                  <Text style={[styles.statValue, { color: '#40B869' }]}>{stats.occupied}</Text>
                  <Text style={styles.statLabel}>Occupied</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <MaterialIcons name="home-work" size={24} color="#FF9800" />
                  <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.vacant}</Text>
                  <Text style={styles.statLabel}>Vacant</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.nairaIconLarge}>₦</Text>
                  <Text style={[styles.statValue, styles.revenueStatValue]}>
                    {stats.monthlyRevenue > 0 ? Math.round(stats.monthlyRevenue).toLocaleString() : '0'}
                  </Text>
                  <Text style={styles.statLabel}>Monthly Revenue</Text>
                </View>
              </View>
            </View>



            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <View style={styles.amenitiesContainer}>
                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenitiesList}>
                  {property.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityChip}>
                      <MaterialIcons name="check-circle" size={16} color={colors.secondary} />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Units Section */}
            <View style={styles.unitsSection}>
              <View style={styles.unitsSectionHeader}>
                <Text style={styles.sectionTitle}>Units ({units.length})</Text>
                <TouchableOpacity style={styles.addUnitButton} onPress={handleAddUnit}>
                  <MaterialIcons name="add" size={16} color={colors.secondary} />
                  <Text style={styles.addUnitText}>Add Unit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.unitsList}>
                {units.map((unit) => (
                  <TouchableOpacity
                    key={unit.id}
                    style={styles.unitCard}
                    onPress={() => handleUnitPress(unit)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.unitHeader}>
                      <Text style={styles.unitNumber}>Unit {unit.unitNumber}</Text>
                      <View style={[
                        styles.unitStatusBadge,
                        { backgroundColor: unit.isAvailable ? '#40B86915' : '#FF980015' }
                      ]}>
                        <Text style={[
                          styles.unitStatusText,
                          { color: unit.isAvailable ? '#40B869' : '#FF9800' }
                        ]}>
                          {unit.isAvailable ? 'Available' : 'Occupied'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.unitDetails}>
                      <View style={styles.unitDetail}>
                        <MaterialIcons name="bed" size={16} color="#666666" />
                        <Text style={styles.unitDetailText}>{unit.bedrooms} bed</Text>
                      </View>
                      <View style={styles.unitDetail}>
                        <MaterialIcons name="bathtub" size={16} color="#666666" />
                        <Text style={styles.unitDetailText}>{unit.bathrooms} bath</Text>
                      </View>
                      <View style={styles.unitDetail}>
                        <Text style={styles.nairaIcon}>₦</Text>
                        <Text style={styles.unitDetailText}>{parseFloat(unit.rent || 0).toLocaleString()}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Show message if no property */}
        {!loading && !property && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>No property data available</Text>
          </View>
        )}

        {/* Show loading indicator */}
        {loading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Loading property details...</Text>
          </View>
        )}
      </ScrollView>


      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
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
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    marginBottom: 20,
  },
  propertyImage: {
    width: width,
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
    marginTop: 8,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Outfit_500Medium',
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  propertyTitleContainer: {
    flex: 1,
  },
  propertyName: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyType: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  address: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  descriptionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    lineHeight: 24,
  },
  statsContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
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
    marginHorizontal: 4,
    alignItems: 'center',
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
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  revenueStatValue: {
    fontSize: 16,
    textAlign: 'center',
  },
  amenitiesContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.secondary,
    marginLeft: 4,
  },
  unitsSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  unitsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  addUnitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addUnitText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
    marginLeft: 4,
  },
  unitsList: {
    gap: 12,
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitNumber: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  unitStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unitStatusText: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
  },
  unitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  unitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitDetailText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.secondary}10`,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
  },
  nairaIcon: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#666666',
    marginRight: 4,
  },
  nairaIconLarge: {
    fontSize: 24,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
    marginBottom: 8,
  },
});

export default PropertyDetailsScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import CustomAlert from '../components/CustomAlert';
import colors from '../theme/colors';
import { apiService } from '../services/api';

const UnitDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const unitId = params.id as string;
  const propertyId = params.propertyId as string;

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (unitId && propertyId) {
      loadUnitDetails();
    }
  }, [unitId, propertyId]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const loadUnitDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUnit(propertyId, unitId);
      setUnit(response);
    } catch (error: any) {
      console.error('Error loading unit details:', error);
      showAlert('error', 'Failed to Load Unit', error.message || 'Unable to load unit details.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUnitDetails();
    setRefreshing(false);
  };

  const handleEditUnit = () => {
    router.push(`/landlord/edit-unit?id=${unitId}&propertyId=${propertyId}`);
  };

  const handleAddTenant = () => {
    router.push(`/landlord/add-tenant?unitId=${unitId}&propertyId=${propertyId}`);
  };

  const handleDeleteUnit = () => {
    Alert.alert(
      'Delete Unit',
      'Are you sure you want to delete this unit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteUnit
        },
      ]
    );
  };

  const confirmDeleteUnit = async () => {
    try {
      await apiService.deleteUnit(propertyId, unitId);
      showAlert('success', 'Unit Deleted', 'Unit has been successfully deleted.');

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      showAlert('error', 'Delete Failed', error.message || 'Failed to delete unit.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Unit Details" showBack={true} onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading unit details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!unit) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Unit Details" showBack={true} onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#E0E0E0" />
          <Text style={styles.errorText}>Unit not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUnitDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={`Unit ${unit.unitNumber}`}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditUnit}>
          <MaterialIcons name="edit" size={18} color={colors.secondary} />
          <Text style={styles.actionButtonText}>Edit Unit</Text>
        </TouchableOpacity>

        {unit.isAvailable && (
          <TouchableOpacity style={styles.actionButton} onPress={handleAddTenant}>
            <MaterialIcons name="person-add" size={18} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Add Tenant</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteUnit}>
          <MaterialIcons name="delete" size={18} color="#FF4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>

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
          {/* Unit Status */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: unit.isAvailable ? '#40B86915' : '#FF980015' }
            ]}>
              <MaterialIcons
                name={unit.isAvailable ? 'check-circle' : 'person'}
                size={20}
                color={unit.isAvailable ? '#40B869' : '#FF9800'}
              />
              <Text style={[
                styles.statusText,
                { color: unit.isAvailable ? '#40B869' : '#FF9800' }
              ]}>
                {unit.isAvailable ? 'Available' : 'Occupied'}
              </Text>
            </View>
          </View>

          {/* Unit Details Cards */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailCard}>
              <MaterialIcons name="bed" size={24} color={colors.secondary} />
              <Text style={styles.detailValue}>{unit.bedrooms}</Text>
              <Text style={styles.detailLabel}>Bedrooms</Text>
            </View>

            <View style={styles.detailCard}>
              <MaterialIcons name="bathtub" size={24} color={colors.secondary} />
              <Text style={styles.detailValue}>{unit.bathrooms}</Text>
              <Text style={styles.detailLabel}>Bathrooms</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.nairaIcon}>₦</Text>
              <Text style={styles.detailValue}>{parseFloat(unit.rent || 0).toLocaleString()}</Text>
              <Text style={styles.detailLabel}>Monthly Rent</Text>
            </View>
          </View>

          {/* Square Footage */}
          {unit.squareFootage && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Size</Text>
              <View style={styles.infoCard}>
                <MaterialIcons name="square-foot" size={20} color="#666" />
                <Text style={styles.infoText}>{unit.squareFootage} sq ft</Text>
              </View>
            </View>
          )}

          {/* Description */}
          {unit.description && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.infoCard}>
                <Text style={styles.descriptionText}>{unit.description}</Text>
              </View>
            </View>
          )}

          {/* Amenities */}
          {unit.amenities && unit.amenities.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {unit.amenities.map((amenity: string, index: number) => (
                  <View key={index} style={styles.amenityChip}>
                    <MaterialIcons name="check-circle" size={16} color={colors.secondary} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Current Tenant Info */}
          {!unit.isAvailable && unit.tenant && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Current Tenant</Text>
              <View style={styles.tenantCard}>
                <View style={styles.tenantInfo}>
                  <MaterialIcons name="person" size={24} color={colors.secondary} />
                  <View style={styles.tenantDetails}>
                    <Text style={styles.tenantName}>
                      {unit.tenant.firstName} {unit.tenant.lastName}
                    </Text>
                    <Text style={styles.tenantEmail}>{unit.tenant.email}</Text>
                    {unit.tenant.phone && (
                      <Text style={styles.tenantPhone}>{unit.tenant.phone}</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

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
  deleteButton: {
    backgroundColor: '#FF444410',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
  },
  deleteButtonText: {
    color: '#FF4444',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  detailCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flex: 1,
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
  detailValue: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  amenitiesContainer: {
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
    gap: 4,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.secondary,
  },
  tenantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  tenantEmail: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 2,
  },
  tenantPhone: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  nairaIcon: {
    fontSize: 24,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
    marginBottom: 8,
  },
});

export default UnitDetailsScreen;
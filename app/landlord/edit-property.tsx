import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import CustomAlert from '../components/CustomAlert';
import { apiService } from '../services/api';
import { Property } from '../types/api';

const EditPropertyScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    propertyType: 'apartment',
    description: '',
    totalUnits: '',
    monthlyRent: '',
    amenities: [] as string[],
  });

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    loadPropertyData();
  }, [propertyId]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      const propertyData = await apiService.getPropertyWithUnits(propertyId);
      setProperty(propertyData);
      
      // Populate form with existing data
      setFormData({
        name: propertyData.name || '',
        address: propertyData.address || '',
        city: propertyData.city || '',
        state: propertyData.state || '',
        propertyType: propertyData.propertyType || 'apartment',
        description: propertyData.description || '',
        totalUnits: propertyData.totalUnits?.toString() || '',
        monthlyRent: propertyData.monthlyRent?.toString() || '',
        amenities: propertyData.amenities || [],
      });
    } catch (error: any) {
      console.error('Error loading property:', error);
      showAlert('error', 'Failed to Load Property', error.message || 'Unable to load property data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showAlert('warning', 'Validation Error', 'Property name is required.');
      return false;
    }
    if (!formData.address.trim()) {
      showAlert('warning', 'Validation Error', 'Address is required.');
      return false;
    }
    if (!formData.city.trim()) {
      showAlert('warning', 'Validation Error', 'City is required.');
      return false;
    }
    if (!formData.state.trim()) {
      showAlert('warning', 'Validation Error', 'State is required.');
      return false;
    }
    if (!formData.totalUnits || parseInt(formData.totalUnits) <= 0) {
      showAlert('warning', 'Validation Error', 'Please enter a valid number of units.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const updateData = {
        ...formData,
        totalUnits: parseInt(formData.totalUnits),
        monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
      };

      await apiService.updateProperty(propertyId, updateData);
      
      showAlert('success', 'Property Updated', 'Property has been successfully updated.');
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating property:', error);
      showAlert('error', 'Update Failed', error.message || 'Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const propertyTypes = [
    { label: 'Apartment', value: 'apartment' },
    { label: 'House', value: 'house' },
    { label: 'Condo', value: 'condo' },
    { label: 'Townhouse', value: 'townhouse' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Edit Property" showBack={true} onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading property data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header 
          title="Edit Property" 
          showBack={true} 
          onBack={() => router.back()}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Property Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter property name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter property address"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholderTextColor="#999"
                multiline
              />
            </View>

            {/* City & State */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Type</Text>
              <View style={styles.propertyTypeContainer}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.propertyTypeButton,
                      formData.propertyType === type.value && styles.propertyTypeButtonActive
                    ]}
                    onPress={() => handleInputChange('propertyType', type.value)}
                  >
                    <Text style={[
                      styles.propertyTypeText,
                      formData.propertyType === type.value && styles.propertyTypeTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Total Units & Monthly Rent */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Total Units *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.totalUnits}
                  onChangeText={(value) => handleInputChange('totalUnits', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Monthly Rent (₦)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.monthlyRent}
                  onChangeText={(value) => handleInputChange('monthlyRent', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter property description"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>

            {/* Amenities */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amenities</Text>
              <View style={styles.amenityInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
                  placeholder="Add amenity"
                  value={newAmenity}
                  onChangeText={setNewAmenity}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.addAmenityButton} onPress={addAmenity}>
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {formData.amenities.length > 0 && (
                <View style={styles.amenitiesList}>
                  {formData.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityChip}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                      <TouchableOpacity onPress={() => removeAmenity(amenity)}>
                        <MaterialIcons name="close" size={16} color={colors.secondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Updating...' : 'Update Property'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  propertyTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#fff',
  },
  propertyTypeButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  propertyTypeText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  propertyTypeTextActive: {
    color: '#fff',
  },
  amenityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addAmenityButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.secondary,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
});

export default EditPropertyScreen;
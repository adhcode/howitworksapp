import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReportMaintenanceScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  useEffect(() => {
    if (token) {
      loadProperties();
    } else {
      setLoadingProperties(false);
      setLoadingError('Not authenticated');
    }
  }, [token]);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      setLoadingError(null);
      
      console.log('🔄 Fetching properties for maintenance form...');
      console.log('User:', user?.email);
      console.log('Token exists:', !!token);
      
      // Clear cache to ensure fresh data
      apiService.clearCache('properties');
      const response = await apiService.getProperties(1, 100);
      
      console.log('📦 Raw API response:', JSON.stringify(response, null, 2));
      
      // Handle different response formats
      let propertiesData: any[] = [];
      if (response && response.data && Array.isArray(response.data)) {
        propertiesData = response.data;
      } else if (response && Array.isArray(response)) {
        propertiesData = response;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
      }
      
      console.log('✅ Loaded properties for maintenance form:', propertiesData.length);
      console.log('Properties:', propertiesData.map(p => ({ id: p.id, name: p.name })));
      
      setProperties(propertiesData);
      
      if (propertiesData.length === 0) {
        console.log('⚠️ No properties found for this landlord');
      }
    } catch (error: any) {
      console.error('❌ Error loading properties:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      setLoadingError(error.message || 'Failed to load properties');
      Alert.alert('Error', 'Failed to load properties. Please try again.');
    } finally {
      setLoadingProperties(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await apiService.uploadFile(formData);
      setImages([...images, response.url]);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageOptionSelect = (option: 'camera' | 'library') => {
    console.log('📸 Image option selected:', option);
    setShowImageOptions(false);
    
    // Use setTimeout to ensure modal closes before opening image picker
    setTimeout(() => {
      if (option === 'camera') {
        console.log('📷 Opening camera...');
        takePhoto();
      } else {
        console.log('🖼️ Opening photo library...');
        pickImage();
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (!formData.propertyId) {
      Alert.alert('Error', 'Please select a property');
      return;
    }
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setLoading(true);
      await apiService.reportLandlordMaintenance({
        ...formData,
        images,
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error submitting maintenance request:', error);
      Alert.alert('Error', error.message || 'Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { label: 'Low', value: 'low', color: '#34C759' },
    { label: 'Medium', value: 'medium', color: '#FFCC00' },
    { label: 'High', value: 'high', color: '#FF9500' },
    { label: 'Urgent', value: 'urgent', color: '#FF3B30' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Report Maintenance</Text>
              <Text style={styles.subtitle}>Submit a maintenance issue</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Property Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Property *</Text>
              {loadingProperties ? (
                <View style={styles.loadingPropertiesContainer}>
                  <ActivityIndicator size="small" color={colors.secondary} />
                  <Text style={styles.loadingPropertiesText}>Loading properties...</Text>
                </View>
              ) : loadingError ? (
                <View style={styles.errorPropertiesContainer}>
                  <MaterialIcons name="error-outline" size={24} color="#FF6B6B" />
                  <Text style={styles.errorPropertiesText}>{loadingError}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadProperties}
                  >
                    <MaterialIcons name="refresh" size={16} color="#fff" />
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : properties.length === 0 ? (
                <View style={styles.noPropertiesContainer}>
                  <MaterialIcons name="home" size={32} color="#FF9800" />
                  <Text style={styles.noPropertiesText}>No properties found. Please add a property first.</Text>
                  <TouchableOpacity
                    style={styles.addPropertyButton}
                    onPress={() => router.push('/landlord/add-property?from=maintenance')}
                  >
                    <MaterialIcons name="add" size={16} color="#fff" />
                    <Text style={styles.addPropertyButtonText}>Add Property</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      formData.propertyId && styles.dropdownButtonSelected,
                    ]}
                    onPress={() => setShowPropertyDropdown(true)}
                  >
                    <MaterialIcons name="home" size={20} color={formData.propertyId ? colors.secondary : '#999'} />
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        !formData.propertyId && styles.placeholderText,
                        formData.propertyId && styles.dropdownButtonTextSelected,
                      ]}
                    >
                      {formData.propertyId
                        ? properties.find((p) => p.id === formData.propertyId)?.name || 'Select a property'
                        : 'Select a property'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#999" />
                  </TouchableOpacity>
                  {formData.propertyId && (
                    <Text style={styles.selectedPropertyHelper}>
                      {properties.find((p) => p.id === formData.propertyId)?.address}
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Broken water heater"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the maintenance issue in detail..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority *</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityButton,
                      formData.priority === priority.value && {
                        backgroundColor: `${priority.color}15`,
                        borderColor: priority.color,
                      },
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        priority: priority.value as any,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        formData.priority === priority.value && {
                          color: priority.color,
                          fontFamily: 'Outfit_600SemiBold',
                        },
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Images */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Images (Optional)</Text>
              <Text style={styles.helperText}>Add photos to help describe the issue</Text>
              
              {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                  {images.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: image }} style={styles.uploadedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <MaterialIcons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => setShowImageOptions(true)}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={colors.secondary} />
                ) : (
                  <>
                    <MaterialIcons name="add-photo-alternate" size={24} color={colors.secondary} />
                    <Text style={styles.addImageText}>Add Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Property Dropdown Modal */}
      <Modal
        visible={showPropertyDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPropertyDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPropertyDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Property</Text>
              <TouchableOpacity onPress={() => setShowPropertyDropdown(false)}>
                <MaterialIcons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {properties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={[
                    styles.modalItem,
                    formData.propertyId === property.id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, propertyId: property.id });
                    setShowPropertyDropdown(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <MaterialIcons
                      name="home"
                      size={20}
                      color={formData.propertyId === property.id ? colors.secondary : '#666'}
                    />
                    <View style={styles.modalItemText}>
                      <Text
                        style={[
                          styles.modalItemName,
                          formData.propertyId === property.id && styles.modalItemNameSelected,
                        ]}
                      >
                        {property.name}
                      </Text>
                      <Text style={styles.modalItemAddress}>{property.address}</Text>
                    </View>
                  </View>
                  {formData.propertyId === property.id && (
                    <MaterialIcons name="check" size={24} color={colors.secondary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowImageOptions(false)}
          />
          <View style={styles.imageOptionsModal}>
            <View style={styles.imageOptionsHeader}>
              <Text style={styles.imageOptionsTitle}>Add Image</Text>
              <Text style={styles.imageOptionsSubtitle}>Choose an option</Text>
            </View>
            
            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={() => handleImageOptionSelect('camera')}
              activeOpacity={0.7}
            >
              <View style={styles.imageOptionIconContainer}>
                <MaterialIcons name="camera-alt" size={24} color={colors.secondary} />
              </View>
              <View style={styles.imageOptionTextContainer}>
                <Text style={styles.imageOptionTitle}>Take Photo</Text>
                <Text style={styles.imageOptionDescription}>Use your camera to take a photo</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={() => handleImageOptionSelect('library')}
              activeOpacity={0.7}
            >
              <View style={styles.imageOptionIconContainer}>
                <MaterialIcons name="photo-library" size={24} color={colors.secondary} />
              </View>
              <View style={styles.imageOptionTextContainer}>
                <Text style={styles.imageOptionTitle}>Choose from Library</Text>
                <Text style={styles.imageOptionDescription}>Select from your photo gallery</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageCancelButton}
              onPress={() => setShowImageOptions(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.imageCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={64} color={colors.secondary} />
            </View>
            <Text style={styles.successTitle}>Request Submitted!</Text>
            <Text style={styles.successMessage}>
              Your maintenance request has been submitted successfully. We'll notify you when there are updates.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dropdownButtonSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}08`,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  dropdownButtonTextSelected: {
    color: colors.secondary,
    fontFamily: 'Outfit_500Medium',
  },
  placeholderText: {
    color: '#999',
  },
  selectedPropertyHelper: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginTop: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  submitButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  helperText: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
    marginBottom: 12,
  },
  imagesScroll: {
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
    paddingVertical: 16,
    gap: 8,
  },
  addImageText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
  },
  loadingPropertiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    gap: 12,
  },
  loadingPropertiesText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  errorPropertiesContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  errorPropertiesText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  noPropertiesContainer: {
    backgroundColor: '#FFF5E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  noPropertiesText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  addPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  addPropertyButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemSelected: {
    backgroundColor: `${colors.secondary}08`,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalItemText: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
    marginBottom: 4,
  },
  modalItemNameSelected: {
    color: colors.secondary,
    fontFamily: 'Outfit_600SemiBold',
  },
  modalItemAddress: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  imageOptionsModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    marginTop: 'auto',
  },
  imageOptionsHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  imageOptionsTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  imageOptionsSubtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  imageOptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  imageOptionTextContainer: {
    flex: 1,
  },
  imageOptionTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  imageOptionDescription: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  imageCancelButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  imageCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#666',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});

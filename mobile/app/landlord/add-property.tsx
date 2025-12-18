import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Modal, FlatList, Pressable, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import colors from '../theme/colors';
// @ts-ignore: no types for naija-state-local-government
import naijaStates from 'naija-state-local-government';
import Header from '../components/Header';
import { CustomAlert } from '../components/CustomAlert';
import { apiService } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const states = naijaStates.states();
const propertyTypes = [
    { label: 'Apartment', value: 'apartment' },
    { label: 'House', value: 'house' },
    { label: 'Duplex', value: 'duplex' },
    { label: 'Condo', value: 'condo' },
    { label: 'Studio', value: 'studio' },
];

const commonAmenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Security', 'Generator',
    'Water Supply', 'Internet', 'Garden', 'Playground', 'Elevator',
    'Balcony', 'Air Conditioning', 'Furnished', 'Pet Friendly'
];

const AddPropertyScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addNotification } = useNotifications();
    const [propertyName, setPropertyName] = useState('');
    const [address, setAddress] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [propertyTypeLabel, setPropertyTypeLabel] = useState('');
    const [units, setUnits] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'state' | 'city' | 'propertyType' | 'amenities' | 'imageOptions' | null>(null);

    // Alert state
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
        onConfirm: undefined as (() => void) | undefined,
        confirmText: 'OK',
        cancelText: 'Cancel',
    });

    // Get cities for selected state
    const cityOptions = state ? naijaStates.lgas(state).lgas : [];

    const openModal = (type: 'state' | 'city' | 'propertyType' | 'amenities' | 'imageOptions') => {
        setModalType(type);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalType(null);
    };

    const handleSelect = (value: string, label?: string) => {
        if (modalType === 'state') {
            setState(value);
            setCity(''); // Reset city when state changes
        } else if (modalType === 'city') {
            setCity(value);
        } else if (modalType === 'propertyType') {
            setPropertyType(value);
            setPropertyTypeLabel(label || value);
        }
        closeModal();
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const showAlert = (config: Omit<typeof alertConfig, 'visible'>) => {
        setAlertConfig({ ...config, visible: true });
    };

    const hideAlert = () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert({
                type: 'warning',
                title: 'Permission Required',
                message: 'Please grant camera roll permissions to upload images.',
            });
            return false;
        }
        return true;
    };

    const pickImageFromLibrary = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.6, // Reduced quality for better compression
                allowsEditing: false,
            });

            if (!result.canceled && result.assets) {
                // Process and compress images
                const processedImages: ImagePicker.ImagePickerAsset[] = [];

                for (const asset of result.assets) {
                    try {
                        // Compress the image
                        const compressedImage = await compressImage(asset.uri);
                        processedImages.push(compressedImage);
                    } catch (error) {
                        console.error('Error processing image:', error);
                        // Use original if compression fails and it's under 10MB
                        if (!asset.fileSize || asset.fileSize <= 10 * 1024 * 1024) {
                            processedImages.push(asset);
                        } else {
                            showAlert('error', 'File Too Large', `Image ${asset.fileName || 'selected'} is too large and couldn't be compressed.`);
                        }
                    }
                }

                if (processedImages.length > 0) {
                    setSelectedImages(prev => [...prev, ...processedImages].slice(0, 5)); // Max 5 images
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            showAlert('error', 'Upload Error', 'Failed to pick image. Please try again.');
        }
        closeModal();
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            showAlert({
                type: 'warning',
                title: 'Permission Required',
                message: 'Please grant camera permissions to take photos.',
            });
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.6, // Reduced quality for better compression
                allowsEditing: true,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];

                try {
                    // Compress the image
                    const compressedImage = await compressImage(asset.uri);
                    setSelectedImages(prev => [...prev, compressedImage].slice(0, 5)); // Max 5 images
                } catch (error) {
                    console.error('Error processing camera image:', error);
                    // Use original if compression fails and it's under 10MB
                    if (!asset.fileSize || asset.fileSize <= 10 * 1024 * 1024) {
                        setSelectedImages(prev => [...prev, asset].slice(0, 5));
                    } else {
                        showAlert('error', 'File Too Large', 'Image is too large and couldn\'t be compressed. Please try again.');
                    }
                }
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            showAlert('error', 'Camera Error', 'Failed to take photo. Please try again.');
        }
        closeModal();
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const compressImage = async (uri: string): Promise<ImagePicker.ImagePickerAsset> => {
        try {
            // First, try to compress the image
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                uri,
                [
                    // Resize if image is too large (max width/height 1920px)
                    { resize: { width: 1920 } }
                ],
                {
                    compress: 0.7, // 70% quality
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );

            // Create a new asset object with compressed image
            return {
                uri: manipulatedImage.uri,
                width: manipulatedImage.width,
                height: manipulatedImage.height,
                type: 'image',
                mimeType: 'image/jpeg',
                fileSize: undefined, // Will be calculated by the system
                fileName: `compressed-${Date.now()}.jpg`,
            } as ImagePicker.ImagePickerAsset;
        } catch (error) {
            console.error('Error compressing image:', error);
            // Return original if compression fails
            return {
                uri,
                type: 'image',
                mimeType: 'image/jpeg',
                fileSize: undefined,
                fileName: `image-${Date.now()}.jpg`,
            } as ImagePicker.ImagePickerAsset;
        }
    };

    const uploadImages = async (): Promise<string[]> => {
        if (selectedImages.length === 0) return [];

        setUploadingImages(true);
        const uploadedUrls: string[] = [];

        try {
            for (const image of selectedImages) {
                try {
                    // Create FormData for image upload
                    const formData = new FormData();
                    formData.append('file', {
                        uri: image.uri,
                        type: image.mimeType || 'image/jpeg',
                        name: image.fileName || `property-image-${Date.now()}.jpg`,
                    } as any);

                    // Try to upload to backend, fallback to local URI
                    try {
                        const uploadResult = await apiService.uploadFile(formData);
                        uploadedUrls.push(uploadResult.url);
                    } catch (uploadError) {
                        console.warn('Backend upload failed, using local URI:', uploadError);
                        // Fallback to local URI for now
                        uploadedUrls.push(image.uri);
                    }
                } catch (error) {
                    console.error('Error processing image:', error);
                    // Skip this image and continue with others
                }
            }

            return uploadedUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw new Error('Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    };

    const validateForm = () => {
        if (!propertyName.trim()) {
            showAlert('warning', 'Missing Information', 'Property name is required to continue.');
            return false;
        }
        if (!address.trim()) {
            showAlert('warning', 'Missing Information', 'Property address is required to continue.');
            return false;
        }
        if (!state) {
            showAlert('warning', 'Missing Information', 'Please select a state to continue.');
            return false;
        }
        if (!city) {
            showAlert('warning', 'Missing Information', 'Please select a city to continue.');
            return false;
        }
        if (!propertyType) {
            showAlert('warning', 'Missing Information', 'Please select a property type to continue.');
            return false;
        }
        if (!units.trim() || isNaN(Number(units)) || Number(units) < 1) {
            showAlert('warning', 'Invalid Input', 'Please enter a valid number of units (minimum 1).');
            return false;
        }
        return true;
    };

    const handleSaveProperty = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Upload images first if any are selected
            let imageUrls: string[] = [];
            if (selectedImages.length > 0) {
                imageUrls = await uploadImages();
            }

            const propertyData = {
                name: propertyName.trim(),
                address: address.trim(),
                city: city,
                state: state,
                country: 'Nigeria',
                propertyType: propertyType as any,
                totalUnits: parseInt(units),
                description: description.trim() || undefined,
                amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
                images: imageUrls.length > 0 ? imageUrls : undefined,
            };

            await apiService.createProperty(propertyData);

            // Add notification for new property
            addNotification({
                title: 'New Property Added',
                message: `${propertyName} has been successfully added to your portfolio`,
                type: 'property_added',
                data: { propertyName },
            });

            showAlert({
                type: 'success',
                title: 'Property Added Successfully!',
                message: 'Your property has been added to your portfolio and is now available for management.',
                onConfirm: () => {
                    hideAlert();
                    if (params.from === 'home' || params.from === 'dashboard') {
                        router.push('/landlord/tabs/home');
                    } else {
                        router.push('/landlord/tabs/property');
                    }
                },
                confirmText: 'View Properties',
            });
        } catch (error: any) {
            console.error('Error creating property:', error);
            showAlert({
                type: 'error',
                title: 'Failed to Add Property',
                message: error.message || 'Something went wrong while adding your property. Please check your connection and try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (params.from === 'home' || params.from === 'dashboard') {
            router.push('/landlord/tabs/home');
        } else if (params.from === 'property') {
            router.push('/landlord/tabs/property');
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.container}>
                    <Header
                        title="Add New Property"
                        showBack={true}
                        onBack={handleBack}
                    />
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={{ paddingBottom: 140 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.form}>
                            <Text style={styles.label}>Property Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={propertyName}
                                onChangeText={setPropertyName}
                                placeholder="Enter property name"
                                editable={!loading}
                            />

                            <Text style={styles.label}>Address *</Text>
                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter full address"
                                multiline
                                numberOfLines={2}
                                editable={!loading}
                            />
                            <Text style={styles.label}>State & City *</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    style={[styles.input, { flex: 1 }]}
                                    activeOpacity={0.7}
                                    onPress={() => openModal('state')}
                                    disabled={loading}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                        <Text style={state ? styles.inputText : styles.inputPlaceholder} numberOfLines={1}>
                                            {state ? state : 'Select State'}
                                        </Text>
                                        <MaterialIcons name="expand-more" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.input, { flex: 1, opacity: !state || loading ? 0.5 : 1 }]}
                                    activeOpacity={0.7}
                                    onPress={() => openModal('city')}
                                    disabled={!state || loading}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                        <Text style={city ? styles.inputText : styles.inputPlaceholder} numberOfLines={1}>
                                            {city ? city : 'Select City'}
                                        </Text>
                                        <MaterialIcons name="expand-more" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Property Type *</Text>
                                    <TouchableOpacity
                                        style={[styles.input, { opacity: loading ? 0.5 : 1 }]}
                                        activeOpacity={0.7}
                                        onPress={() => openModal('propertyType')}
                                        disabled={loading}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                            <Text style={propertyTypeLabel ? styles.inputText : styles.inputPlaceholder} numberOfLines={1}>
                                                {propertyTypeLabel ? propertyTypeLabel : 'Select Type'}
                                            </Text>
                                            <MaterialIcons name="expand-more" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Number of Units *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={units}
                                        onChangeText={setUnits}
                                        placeholder="e.g. 6"
                                        keyboardType="numeric"
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, { minHeight: 80 }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe your property (optional)"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                editable={!loading}
                            />

                            <Text style={styles.label}>Amenities</Text>
                            <TouchableOpacity
                                style={[styles.input, { opacity: loading ? 0.5 : 1 }]}
                                activeOpacity={0.7}
                                onPress={() => openModal('amenities')}
                                disabled={loading}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={selectedAmenities.length > 0 ? styles.inputText : styles.inputPlaceholder} numberOfLines={1}>
                                        {selectedAmenities.length > 0
                                            ? `${selectedAmenities.length} amenities selected`
                                            : 'Select amenities (optional)'
                                        }
                                    </Text>
                                    <MaterialIcons name="expand-more" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                </View>
                            </TouchableOpacity>

                            {selectedAmenities.length > 0 && (
                                <View style={styles.amenitiesContainer}>
                                    {selectedAmenities.map((amenity, index) => (
                                        <View key={index} style={styles.amenityTag}>
                                            <Text style={styles.amenityText}>{amenity}</Text>
                                            <TouchableOpacity onPress={() => toggleAmenity(amenity)} disabled={loading}>
                                                <MaterialIcons name="close" size={16} color={colors.secondary} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <Text style={styles.label}>Property Images</Text>

                            {/* Selected Images Preview */}
                            {selectedImages.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.imagePreviewContainer}
                                >
                                    {selectedImages.map((image, index) => (
                                        <View key={index} style={styles.imagePreview}>
                                            <Image source={{ uri: image.uri }} style={styles.previewImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(index)}
                                                disabled={loading || uploadingImages}
                                            >
                                                <MaterialIcons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}

                            {/* Upload Button */}
                            <TouchableOpacity
                                style={[styles.imageBox, { opacity: loading || uploadingImages ? 0.5 : 1 }]}
                                onPress={() => openModal('imageOptions')}
                                disabled={loading || uploadingImages || selectedImages.length >= 5}
                            >
                                {uploadingImages ? (
                                    <View style={styles.uploadingContainer}>
                                        <ActivityIndicator size="small" color={colors.secondary} />
                                        <Text style={styles.uploadingText}>Uploading images...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <MaterialIcons
                                            name="add-photo-alternate"
                                            size={40}
                                            color={selectedImages.length >= 5 ? '#ccc' : colors.secondary}
                                        />
                                        <Text style={[styles.imageText, { color: selectedImages.length >= 5 ? '#ccc' : '#666' }]}>
                                            {selectedImages.length >= 5
                                                ? 'Maximum 5 images allowed'
                                                : selectedImages.length > 0
                                                    ? `Add more images (${selectedImages.length}/5)`
                                                    : 'Add property images (Max 5, 10MB each)'
                                            }
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    <View style={styles.fixedButtonContainer}>
                        <TouchableOpacity
                            style={[styles.saveBtn, { opacity: loading ? 0.7 : 1 }]}
                            onPress={handleSaveProperty}
                            disabled={loading}
                        >
                            {loading ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.saveBtnText}>Saving...</Text>
                                </View>
                            ) : (
                                <Text style={styles.saveBtnText}>Save Property</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    {/* Modal Picker */}
                    <Modal visible={modalVisible} transparent animationType="fade">
                        <Pressable style={styles.modalOverlay} onPress={closeModal} />
                        <View style={styles.modalContent}>
                            {modalType === 'imageOptions' ? (
                                <View>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Add Images</Text>
                                        <TouchableOpacity onPress={closeModal}>
                                            <MaterialIcons name="close" size={24} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={styles.imageOptionItem} onPress={takePhoto}>
                                        <MaterialIcons name="camera-alt" size={24} color={colors.secondary} />
                                        <Text style={styles.imageOptionText}>Take Photo</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.imageOptionItem} onPress={pickImageFromLibrary}>
                                        <MaterialIcons name="photo-library" size={24} color={colors.secondary} />
                                        <Text style={styles.imageOptionText}>Choose from Gallery</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : modalType === 'amenities' ? (
                                <View>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Select Amenities</Text>
                                        <TouchableOpacity onPress={closeModal}>
                                            <MaterialIcons name="close" size={24} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        data={commonAmenities}
                                        keyExtractor={item => item}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.amenityModalItem}
                                                onPress={() => toggleAmenity(item)}
                                            >
                                                <Text style={styles.modalItemText}>{item}</Text>
                                                <MaterialIcons
                                                    name={selectedAmenities.includes(item) ? "check-box" : "check-box-outline-blank"}
                                                    size={24}
                                                    color={selectedAmenities.includes(item) ? colors.secondary : '#ccc'}
                                                />
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            ) : (
                                <FlatList
                                    data={
                                        modalType === 'state' ? states :
                                            modalType === 'city' ? cityOptions :
                                                modalType === 'propertyType' ? propertyTypes : []
                                    }
                                    keyExtractor={item => typeof item === 'string' ? item : item.value}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => {
                                                if (typeof item === 'string') {
                                                    handleSelect(item);
                                                } else {
                                                    handleSelect(item.value, item.label);
                                                }
                                            }}
                                        >
                                            <Text style={styles.modalItemText}>
                                                {typeof item === 'string' ? item : item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </Modal>

                    {/* Custom Alert */}
                    <CustomAlert
                        visible={alertConfig.visible}
                        type={alertConfig.type}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        onClose={hideAlert}
                        onConfirm={alertConfig.onConfirm}
                        confirmText={alertConfig.confirmText}
                        cancelText={alertConfig.cancelText}
                    />
                </View>
            </KeyboardAvoidingView>
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
        padding: 20,
    },
    form: {
        flex: 1,
    },
    label: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.primary,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 48,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    inputText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
        flex: 1,
    },
    inputPlaceholder: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#B0B0B0',
        flex: 1
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    imageBox: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 6,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    imageText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    imagePreviewContainer: {
        marginBottom: 12,
    },
    imagePreview: {
        position: 'relative',
        marginRight: 12,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.secondary,
        marginTop: 8,
    },
    imageOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    imageOptionText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
        marginLeft: 16,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    saveBtn: {
        backgroundColor: colors.secondary,
        borderRadius: 6,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '50%',
    },
    modalItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalItemText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
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
    amenityModalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    amenityTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary + '15',
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
});

export default AddPropertyScreen; 
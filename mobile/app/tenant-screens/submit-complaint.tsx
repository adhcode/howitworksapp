import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';
import Header from '../components/Header';
import { apiService } from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

interface ComplaintForm {
    title: string;
    description: string;
    category: string;
    photos: string[];
}

const SubmitComplaintScreen = () => {
    const [form, setForm] = useState<ComplaintForm>({
        title: '',
        description: '',
        category: '',
        photos: []
    });

    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const categories = [
        'Maintenance Issue',
        'Noise Complaint',
        'Facility Request',
        'Security Concern',
        'Cleanliness Issue',
        'Parking Problem',
        'Utility Issue',
        'General Complaint'
    ];

    const handleInputChange = (field: keyof ComplaintForm, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCategorySelect = (category: string) => {
        handleInputChange('category', category);
        setShowCategoryDropdown(false);
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert('warning', 'Permission Required', 'Sorry, we need camera roll permissions to upload images.');
            return false;
        }
        return true;
    };

    const handlePhotoUpload = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        Alert.alert(
            'Upload Photo',
            'Choose photo source',
            [
                { text: 'Camera', onPress: openCamera },
                { text: 'Gallery', onPress: openGallery },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            showAlert('warning', 'Permission Required', 'Sorry, we need camera permissions to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            uploadImage(result.assets[0]);
        }
    };

    const openGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            uploadImage(result.assets[0]);
        }
    };

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || 'image.jpg',
            } as any);

            const response = await apiService.uploadFile(formData);

            if (response?.url) {
                setForm(prev => ({
                    ...prev,
                    photos: [...prev.photos, response.url]
                }));
                showAlert('success', 'Success', 'Image uploaded successfully!');
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            showAlert('error', 'Upload Failed', 'Failed to upload image. Please try again.');
        }
    };

    const removePhoto = (index: number) => {
        setForm(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleAddAnotherImage = () => {
        if (form.photos.length < 5) {
            handlePhotoUpload();
        } else {
            Alert.alert('Limit Reached', 'You can upload maximum 5 images');
        }
    };

    const [submitting, setSubmitting] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
    });

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertConfig({ type, title, message });
        setAlertVisible(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            showAlert('warning', 'Error', 'Please enter a title');
            return;
        }
        if (!form.description.trim()) {
            showAlert('warning', 'Error', 'Please enter a description');
            return;
        }
        if (!form.category) {
            showAlert('warning', 'Error', 'Please select a category');
            return;
        }

        try {
            setSubmitting(true);

            const requestData = {
                title: form.title.trim(),
                description: form.description.trim(),
                priority: 'medium', // Default priority
                images: form.photos, // Include uploaded photos
            };

            await apiService.createMaintenanceRequest(requestData);

            showAlert('success', 'Success', 'Your maintenance request has been submitted successfully. You will receive updates on the progress.');

            // Reset form
            setForm({
                title: '',
                description: '',
                category: '',
                photos: []
            });

            // Navigate back after a delay
            setTimeout(() => {
                router.back();
            }, 2000);

        } catch (error: any) {
            console.error('Error submitting maintenance request:', error);
            showAlert('error', 'Error', error.message || 'Failed to submit maintenance request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid = form.title.trim() && form.description.trim() && form.category;

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Submit New Complaint" showBack={true} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title Field */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Title</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter Title"
                        placeholderTextColor={colors.textGray}
                        value={form.title}
                        onChangeText={(text) => handleInputChange('title', text)}
                        maxLength={100}
                    />
                </View>

                {/* Description Field */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Description</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        placeholder="Description"
                        placeholderTextColor={colors.textGray}
                        value={form.description}
                        onChangeText={(text) => handleInputChange('description', text)}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                </View>

                {/* Category Dropdown */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    >
                        <Text style={[
                            styles.dropdownText,
                            !form.category && styles.placeholderText
                        ]}>
                            {form.category || 'Select'}
                        </Text>
                        <MaterialIcons
                            name={showCategoryDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={24}
                            color={colors.textGray}
                        />
                    </TouchableOpacity>

                    {showCategoryDropdown && (
                        <View style={styles.dropdownList}>
                            {categories.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dropdownItem,
                                        index === categories.length - 1 && styles.lastDropdownItem
                                    ]}
                                    onPress={() => handleCategorySelect(category)}
                                >
                                    <Text style={styles.dropdownItemText}>{category}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Photo Upload */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Photo Upload</Text>
                    <TouchableOpacity
                        style={styles.uploadContainer}
                        onPress={handlePhotoUpload}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="cloud-upload" size={24} color={colors.textGray} />
                        <Text style={styles.uploadText}>Upload file, Max 1Mb</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={handleAddAnotherImage}
                        disabled={form.photos.length >= 5}
                    >
                        <Text style={[
                            styles.addImageText,
                            form.photos.length >= 5 && styles.disabledText
                        ]}>
                            Add another image ({form.photos.length}/5)
                        </Text>
                    </TouchableOpacity>

                    {/* Photo Preview */}
                    {form.photos.length > 0 && (
                        <View style={styles.photoPreviewContainer}>
                            <Text style={styles.photoPreviewTitle}>Uploaded Images:</Text>
                            <View style={styles.photoGrid}>
                                {form.photos.map((photoUrl, index) => (
                                    <View key={index} style={styles.photoItem}>
                                        <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
                                        <TouchableOpacity
                                            style={styles.removePhotoButton}
                                            onPress={() => removePhoto(index)}
                                        >
                                            <MaterialIcons name="close" size={16} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!isFormValid || submitting) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!isFormValid || submitting}
                    activeOpacity={0.7}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? 'Submitting...' : 'Submit Issue'}
                    </Text>
                </TouchableOpacity>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    fieldLabel: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: colors.text,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
        backgroundColor: colors.card,
    },
    textArea: {
        height: 120,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 16,
        backgroundColor: colors.card,
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
    },
    placeholderText: {
        color: colors.textGray,
    },
    dropdownList: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.card,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    lastDropdownItem: {
        borderBottomWidth: 0,
    },
    dropdownItemText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
    },
    uploadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        borderStyle: 'dashed',
        padding: 40,
        backgroundColor: colors.card,
        gap: 12,
    },
    uploadText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
    },
    addImageButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    addImageText: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.secondary,
    },
    disabledText: {
        color: colors.textGray,
    },
    photoPreviewContainer: {
        marginTop: 16,
    },
    photoPreviewTitle: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.text,
        marginBottom: 12,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    photoItem: {
        position: 'relative',
        width: 80,
        height: 80,
    },
    photoPreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: colors.background,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: colors.secondary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonDisabled: {
        backgroundColor: colors.textGray,
    },
    submitButtonText: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
    },
});

export default SubmitComplaintScreen; 
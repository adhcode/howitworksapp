import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import CustomAlert from '../components/CustomAlert';
import apiService from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const AddUnitScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addNotification } = useNotifications();
    const propertyId = params.propertyId as string;

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [property, setProperty] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        unitNumber: '',
        bedrooms: '',
        bathrooms: '',
        rent: '',
        description: '',
    });

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
    });

    useEffect(() => {
        if (propertyId) {
            loadPropertyData();
        }
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
        } catch (error: any) {
            console.error('Error loading property:', error);
            showAlert('error', 'Failed to Load Property', error.message || 'Unable to load property data.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        // Handle numeric fields with proper validation
        if (field === 'rent' || field === 'bedrooms' || field === 'bathrooms') {
            // Allow only numbers and decimal point for rent, only integers for bedrooms/bathrooms
            const isRent = field === 'rent';
            const regex = isRent ? /^\d*\.?\d*$/ : /^\d*$/;

            if (value === '' || regex.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };



    const validateForm = () => {
        if (!formData.unitNumber.trim()) {
            showAlert('warning', 'Validation Error', 'Unit name/number is required.');
            return false;
        }
        if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) {
            showAlert('warning', 'Validation Error', 'Please enter a valid number of bedrooms (0 or more).');
            return false;
        }
        if (!formData.bathrooms || parseFloat(formData.bathrooms) < 0) {
            showAlert('warning', 'Validation Error', 'Please enter a valid number of bathrooms (0 or more).');
            return false;
        }
        if (!formData.rent || parseFloat(formData.rent) <= 0) {
            showAlert('warning', 'Validation Error', 'Please enter a valid rent amount.');
            return false;
        }
        return true;
    };

    const handleAddUnit = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);

            const unitData = {
                unitNumber: formData.unitNumber.trim(),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseFloat(formData.bathrooms),
                rent: parseFloat(formData.rent),
                description: formData.description.trim() || undefined,
            };

            const response = await apiService.createUnit(propertyId, unitData);

            // Clear property cache to force refresh
            apiService.clearCache(`properties/${propertyId}`);

            // Add notification for new unit
            addNotification({
                title: 'New Unit Added',
                message: `Unit ${formData.unitNumber} has been successfully added`,
                type: 'unit_added',
                data: { unitNumber: formData.unitNumber, propertyId },
            });

            showAlert('success', 'Unit Added Successfully', `Unit "${formData.unitNumber}" has been added to the property.`);

            // Navigate back after a short delay
            setTimeout(() => {
                router.back();
            }, 1500);

        } catch (error: any) {
            console.error('Error adding unit:', error);
            showAlert('error', 'Failed to Add Unit', error.message || 'Failed to add unit. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    title="Add Unit"
                    showBack={true}
                    onBack={() => router.back()}
                />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading property information...</Text>
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
                    title={property ? `Add Unit to ${property.name}` : 'Add Unit'}
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
                        {/* Unit Basic Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Unit Information</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Unit Name/Number *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 101, A1, Studio 1, etc."
                                    value={formData.unitNumber}
                                    onChangeText={(value) => handleInputChange('unitNumber', value)}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Bedrooms *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={formData.bedrooms}
                                        onChangeText={(value) => handleInputChange('bedrooms', value)}
                                        keyboardType="numeric"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Bathrooms *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={formData.bathrooms}
                                        onChangeText={(value) => handleInputChange('bathrooms', value)}
                                        keyboardType="numeric"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Monthly Rent (₦) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter monthly rent amount"
                                    value={formData.rent}
                                    onChangeText={(value) => handleInputChange('rent', value)}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter unit description (optional)"
                                    value={formData.description}
                                    onChangeText={(value) => handleInputChange('description', value)}
                                    multiline
                                    numberOfLines={3}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        {/* Add Unit Button */}
                        <TouchableOpacity
                            style={[styles.addButton, saving && styles.addButtonDisabled]}
                            onPress={handleAddUnit}
                            disabled={saving}
                        >
                            <MaterialIcons name="home" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>
                                {saving ? 'Adding Unit...' : 'Add Unit'}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    form: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
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
        height: 80,
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: colors.secondary,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
    },
});

export default AddUnitScreen; 
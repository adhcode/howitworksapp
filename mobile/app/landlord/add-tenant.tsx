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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../theme/colors';
import Header from '../components/Header';
import { CustomAlert } from '../components/CustomAlert';
import { apiService } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const AddTenantScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addNotification } = useNotifications();
  const propertyId = params.propertyId as string;
  const unitId = params.unitId as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    selectedUnitId: unitId || '',
    tenantFullName: '',
    paymentFrequency: 'Monthly', // Default to Monthly
    rentAmount: '',
    moveInDate: '',
    leaseEndDate: '',
    phoneNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    securityDeposit: '',
    isExistingTenant: false,
  });

  // Date state for the pickers
  const [selectedMoveInDate, setSelectedMoveInDate] = useState(new Date());
  const [selectedLeaseEndDate, setSelectedLeaseEndDate] = useState(new Date());
  const [showMoveInDatePicker, setShowMoveInDatePicker] = useState(false);
  const [showLeaseEndDatePicker, setShowLeaseEndDatePicker] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (propertyId) {
      loadAvailableUnits();
    }
  }, [propertyId]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const loadAvailableUnits = async () => {
    try {
      setLoading(true);
      const property = await apiService.getPropertyWithUnits(propertyId);
      const available = property.units?.filter((unit: any) => unit.isAvailable) || [];
      setAvailableUnits(available);

      // If no unit was pre-selected and there are available units, select the first one
      if (!unitId && available.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedUnitId: available[0].id,
          rentAmount: available[0].rent?.toString() || '',
        }));
      }
    } catch (error: any) {
      console.error('Error loading available units:', error);
      showAlert('error', 'Failed to Load Units', error.message || 'Unable to load available units.');
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

  const handleUnitSelection = (unitId: string) => {
    const selectedUnit = availableUnits.find(unit => unit.id === unitId);
    setFormData(prev => ({
      ...prev,
      selectedUnitId: unitId,
      rentAmount: selectedUnit?.rent?.toString() || '',
    }));
  };

  const getSelectedUnit = () => {
    return availableUnits.find(unit => unit.id === formData.selectedUnitId);
  };

  const handleMoveInDateChange = (event: any, date?: Date) => {
    setShowMoveInDatePicker(false);

    if (event.type === 'set' && date) {
      setSelectedMoveInDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        moveInDate: formattedDate,
      }));

      // If not existing tenant, auto-calculate lease end date (1 year from move-in)
      if (!formData.isExistingTenant) {
        const leaseEnd = new Date(date);
        leaseEnd.setFullYear(leaseEnd.getFullYear() + 1);
        setSelectedLeaseEndDate(leaseEnd);
        setFormData(prev => ({
          ...prev,
          leaseEndDate: leaseEnd.toISOString().split('T')[0],
        }));
      }
    }
  };

  const handleLeaseEndDateChange = (event: any, date?: Date) => {
    setShowLeaseEndDatePicker(false);

    if (event.type === 'set' && date) {
      setSelectedLeaseEndDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        leaseEndDate: formattedDate,
      }));
    }
  };

  const formatDisplayDate = (dateString: string, placeholder: string = 'Select Date') => {
    if (!dateString) return placeholder;

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validateForm = () => {
    if (!formData.selectedUnitId) {
      showAlert('warning', 'Validation Error', 'Please select a unit/apartment.');
      return false;
    }
    if (!formData.tenantFullName.trim()) {
      showAlert('warning', 'Validation Error', 'Tenant full name is required.');
      return false;
    }
    if (!formData.paymentFrequency) {
      showAlert('warning', 'Validation Error', 'Please select payment frequency.');
      return false;
    }
    const selectedUnit = getSelectedUnit();
    if (!selectedUnit) {
      showAlert('warning', 'Validation Error', 'Please select a valid unit.');
      return false;
    }
    if (!formData.moveInDate.trim()) {
      showAlert('warning', 'Validation Error', 'Move-in date is required.');
      return false;
    }
    if (!formData.leaseEndDate.trim()) {
      showAlert('warning', 'Validation Error', 'Lease end date is required.');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      showAlert('warning', 'Validation Error', 'Phone number is required.');
      return false;
    }

    // Validate that lease end date is after move-in date
    const moveIn = new Date(formData.moveInDate);
    const leaseEnd = new Date(formData.leaseEndDate);
    if (leaseEnd <= moveIn) {
      showAlert('warning', 'Validation Error', 'Lease end date must be after move-in date.');
      return false;
    }

    return true;
  };

  const handleGenerateTenantToken = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Split the full name into first and last name
      const nameParts = formData.tenantFullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate a temporary email based on phone number
      // Tenant will provide their real email during signup
      const tempEmail = `tenant_${formData.phoneNumber.replace(/[^0-9]/g, '')}@temp.howitworks.app`;

      const selectedUnit = getSelectedUnit();
      const tenantData = {
        firstName: firstName,
        lastName: lastName,
        email: tempEmail, // Temporary email - tenant will provide real email during signup
        phone: formData.phoneNumber.trim(),
        emergencyContact: '',
        emergencyPhone: '',
        unitId: formData.selectedUnitId,
        propertyId: propertyId,
        leaseStartDate: formData.moveInDate,
        leaseEndDate: formData.leaseEndDate,
        monthlyRent: parseFloat(selectedUnit.rent),
        securityDeposit: 0,
        notes: `Payment Frequency: ${formData.paymentFrequency}`,
        landlordPayoutType: formData.paymentFrequency.toLowerCase() as 'monthly' | 'yearly',
        isExistingTenant: formData.isExistingTenant,
        originalExpiryDate: formData.isExistingTenant ? formData.leaseEndDate : undefined,
      };

      // Use the tenant-invitations API method
      const result = await apiService.addTenant(tenantData);

      // Add notification for new tenant
      addNotification({
        title: 'New Tenant Added',
        message: `${firstName} ${lastName} has been invited to your property`,
        type: 'tenant_added',
        data: { tenantName: `${firstName} ${lastName}`, propertyId },
      });

      // Navigate to success screen with invitation details
      router.push({
        pathname: '/landlord/tenant-invitation-success',
        params: {
          firstName: firstName,
          lastName: lastName,
          token: result.invitationToken,
          phoneNumber: formData.phoneNumber,
        },
      });

    } catch (error: any) {
      console.error('Error generating tenant token:', error);
      showAlert('error', 'Failed to Generate Token', error.message || 'Failed to generate tenant token. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header
          title="Add New Tenant"
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
            {/* Unit/Apartment Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Unit/Apartment Name</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading units...</Text>
                </View>
              ) : (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowUnitDropdown(!showUnitDropdown)}
                  >
                    <Text style={[styles.dropdownText, !formData.selectedUnitId && styles.placeholderText]}>
                      {formData.selectedUnitId
                        ? `Unit ${availableUnits.find(u => u.id === formData.selectedUnitId)?.unitNumber || ''}`
                        : 'Select'
                      }
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                  </TouchableOpacity>

                  {showUnitDropdown && (
                    <View style={styles.dropdownOptions}>
                      {availableUnits.length === 0 ? (
                        <Text style={styles.noOptionsText}>No available units</Text>
                      ) : (
                        availableUnits.map((unit) => (
                          <TouchableOpacity
                            key={unit.id}
                            style={styles.dropdownOption}
                            onPress={() => {
                              handleUnitSelection(unit.id);
                              setShowUnitDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownOptionText}>
                              Unit {unit.unitNumber} - {formatCurrency(unit.rent)}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Tenant Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tenant Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Tenant Full Name"
                value={formData.tenantFullName}
                onChangeText={(value) => handleInputChange('tenantFullName', value)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Payment Frequency */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Frequency</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={[styles.dropdown, formData.paymentFrequency === 'Monthly' && styles.dropdownSelected]}
                  onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                >
                  <MaterialIcons
                    name="schedule"
                    size={20}
                    color={formData.paymentFrequency === 'Monthly' ? colors.secondary : '#666'}
                  />
                  <Text style={[
                    styles.dropdownText,
                    formData.paymentFrequency === 'Monthly' && styles.dropdownTextSelected
                  ]}>
                    {formData.paymentFrequency}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                </TouchableOpacity>

                {showFrequencyDropdown && (
                  <View style={styles.dropdownOptions}>
                    {['Monthly', 'Quarterly', 'Yearly'].map((frequency) => (
                      <TouchableOpacity
                        key={frequency}
                        style={[
                          styles.dropdownOption,
                          formData.paymentFrequency === frequency && styles.dropdownOptionSelected
                        ]}
                        onPress={() => {
                          handleInputChange('paymentFrequency', frequency);
                          setShowFrequencyDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          formData.paymentFrequency === frequency && styles.dropdownOptionTextSelected
                        ]}>
                          {frequency}
                        </Text>
                        {formData.paymentFrequency === frequency && (
                          <MaterialIcons name="check" size={20} color={colors.secondary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Unit Information Display */}
            {formData.selectedUnitId && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Unit Information</Text>
                <View style={styles.unitInfoCard}>
                  {(() => {
                    const selectedUnit = getSelectedUnit();
                    return selectedUnit ? (
                      <>
                        <View style={styles.unitInfoRow}>
                          <Text style={styles.unitInfoLabel}>Unit:</Text>
                          <Text style={styles.unitInfoValue}>Unit {selectedUnit.unitNumber}</Text>
                        </View>
                        <View style={styles.unitInfoRow}>
                          <Text style={styles.unitInfoLabel}>Bedrooms:</Text>
                          <Text style={styles.unitInfoValue}>{selectedUnit.bedrooms}</Text>
                        </View>
                        <View style={styles.unitInfoRow}>
                          <Text style={styles.unitInfoLabel}>Bathrooms:</Text>
                          <Text style={styles.unitInfoValue}>{selectedUnit.bathrooms}</Text>
                        </View>
                        <View style={styles.unitInfoRow}>
                          <Text style={styles.unitInfoLabel}>Monthly Rent:</Text>
                          <Text style={[styles.unitInfoValue, styles.rentAmount]}>
                            {formatCurrency(selectedUnit.rent)}
                          </Text>
                        </View>
                      </>
                    ) : null;
                  })()}
                </View>
              </View>
            )}

            {/* Existing Tenant Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.toggleContainer}>
                <View style={styles.toggleLabelContainer}>
                  <Text style={styles.label}>Existing Tenant</Text>
                  <Text style={styles.helperText}>
                    Check this if tenant moved in before using this app
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.isExistingTenant && styles.toggleButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, isExistingTenant: !prev.isExistingTenant }))}
                >
                  <View style={[
                    styles.toggleCircle,
                    formData.isExistingTenant && styles.toggleCircleActive
                  ]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Move-In Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {formData.isExistingTenant ? 'Original Move-In Date' : 'Move-In Date'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  formData.moveInDate && styles.datePickerButtonSelected
                ]}
                onPress={() => setShowMoveInDatePicker(true)}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color={formData.moveInDate ? colors.secondary : "#666"}
                />
                <Text style={[
                  styles.datePickerText,
                  !formData.moveInDate && styles.placeholderText,
                  formData.moveInDate && styles.datePickerTextSelected
                ]}>
                  {formatDisplayDate(formData.moveInDate)}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={24}
                  color={formData.moveInDate ? colors.secondary : "#666"}
                />
              </TouchableOpacity>

              {showMoveInDatePicker && (
                <DateTimePicker
                  value={selectedMoveInDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleMoveInDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Lease End Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {formData.isExistingTenant ? 'Current Lease Expiry Date' : 'Lease End Date'}
              </Text>
              {!formData.isExistingTenant && formData.leaseEndDate && (
                <Text style={styles.helperText}>
                  Auto-calculated as 1 year from move-in date
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  formData.leaseEndDate && styles.datePickerButtonSelected
                ]}
                onPress={() => setShowLeaseEndDatePicker(true)}
              >
                <MaterialIcons
                  name="event"
                  size={20}
                  color={formData.leaseEndDate ? colors.secondary : "#666"}
                />
                <Text style={[
                  styles.datePickerText,
                  !formData.leaseEndDate && styles.placeholderText,
                  formData.leaseEndDate && styles.datePickerTextSelected
                ]}>
                  {formData.leaseEndDate ? formatDisplayDate(formData.leaseEndDate) : 'Select Lease End Date'}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={24}
                  color={formData.leaseEndDate ? colors.secondary : "#666"}
                />
              </TouchableOpacity>

              {showLeaseEndDatePicker && (
                <DateTimePicker
                  value={selectedLeaseEndDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleLeaseEndDateChange}
                  minimumDate={formData.moveInDate ? new Date(formData.moveInDate) : new Date()}
                />
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Enter Phone Number"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            {/* Generate Tenant Token Button */}
            <TouchableOpacity
              style={[styles.generateButton, saving && styles.generateButtonDisabled]}
              onPress={handleGenerateTenantToken}
              disabled={saving}
            >
              <Text style={styles.generateButtonText}>
                {saving ? 'Generating Token...' : 'Generate Tenant Token'}
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  noOptionsText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  generateButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  datePickerButtonSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}08`,
  },
  datePickerTextSelected: {
    color: colors.secondary,
    fontFamily: 'Outfit_500Medium',
  },
  dropdownSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}08`,
  },
  dropdownTextSelected: {
    color: colors.secondary,
    fontFamily: 'Outfit_500Medium',
  },
  dropdownOptionSelected: {
    backgroundColor: `${colors.secondary}10`,
  },
  dropdownOptionTextSelected: {
    color: colors.secondary,
    fontFamily: 'Outfit_500Medium',
  },
  unitInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  unitInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitInfoLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  unitInfoValue: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
  },
  rentAmount: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  helperText: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginTop: 4,
  },
  toggleButton: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.secondary,
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleActive: {
    transform: [{ translateX: 24 }],
  },
});

export default AddTenantScreen;
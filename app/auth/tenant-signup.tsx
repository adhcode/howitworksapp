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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import CustomAlert from '../components/CustomAlert';
import CustomConfirmation from '../components/CustomConfirmation';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TenantSignupScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const invitationToken = params.token as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  // Form state - will be pre-filled from invitation
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  // Confirmation state
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => { },
  });

  useEffect(() => {
    if (invitationToken) {
      loadInvitationData();
    } else {
      showAlert('error', 'Invalid Invitation', 'No invitation token provided.');
      setLoading(false);
    }
  }, [invitationToken]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationConfig({ title, message, onConfirm });
    setConfirmationVisible(true);
  };

  const loadInvitationData = async () => {
    try {
      setLoading(true);

      // Validate token first
      const validationResponse = await apiService.validateInvitationToken(invitationToken);

      if (!validationResponse.isValid) {
        showAlert('error', 'Invalid Invitation', 'This invitation token is invalid or has expired.');
        return;
      }

      // Get invitation details
      const invitationData = await apiService.getInvitationByToken(invitationToken);



      if (!invitationData) {
        showAlert('error', 'Invitation Not Found', 'Unable to load invitation details.');
        return;
      }

      setInvitationData(invitationData);

      // Pre-fill form with invitation data


      setFormData(prev => ({
        ...prev,
        firstName: invitationData.firstName || '',
        lastName: invitationData.lastName || '',
        email: '', // Leave email empty for tenant to provide their real email
        phone: invitationData.phone || '',
        nextOfKinName: invitationData.emergencyContact || '',
        nextOfKinPhone: invitationData.emergencyPhone || '',
      }));

    } catch (error: any) {
      console.error('Error loading invitation:', error);
      showAlert('error', 'Failed to Load Invitation', error.message || 'Unable to load invitation details.');
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

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      showAlert('warning', 'Validation Error', 'First name is required.');
      return false;
    }
    if (!formData.lastName.trim()) {
      showAlert('warning', 'Validation Error', 'Last name is required.');
      return false;
    }
    if (!formData.email.trim()) {
      showAlert('warning', 'Validation Error', 'Email is required.');
      return false;
    }
    if (formData.password.length < 6) {
      showAlert('warning', 'Validation Error', 'Password must be at least 6 characters long.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showAlert('warning', 'Validation Error', 'Passwords do not match.');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert('warning', 'Validation Error', 'Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    console.log('=== SIGNUP BUTTON CLICKED ===');
    console.log('Form data:', JSON.stringify(formData, null, 2));
    console.log('Invitation token:', invitationToken);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, showing confirmation');

    showConfirmation(
      'Create Account',
      'Are you sure you want to create your tenant account? This will complete your registration.',
      async () => {
        console.log('User confirmed account creation');
        setConfirmationVisible(false);

        try {
          setSaving(true);

          const signupData = {
            token: invitationToken,
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            nextOfKinName: formData.nextOfKinName,
            nextOfKinPhone: formData.nextOfKinPhone,
          };

          console.log('=== FRONTEND REGISTRATION DEBUG ===');
          console.log('Signup data:', JSON.stringify(signupData, null, 2));
          console.log('About to call registerWithInvitation...');

          const result = await apiService.registerWithInvitation(signupData);
          console.log('Registration result:', JSON.stringify(result, null, 2));

          showAlert('success', 'Account Created!', 'Your tenant account has been created successfully. You can now access your tenant portal.');

          // Auto-login the user
          setTimeout(async () => {
            try {
              await login(formData.email, formData.password);
              router.replace('/tenant/tabs/home');
            } catch (error) {
              // If auto-login fails, redirect to login
              router.replace('/auth/login');
            }
          }, 2000);

        } catch (error: any) {
          console.error('Error creating account:', error);
          showAlert('error', 'Signup Failed', error.message || 'Failed to create account. Please try again.');
        } finally {
          setSaving(false);
        }
      }
    );
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
        <Header title="Loading Invitation..." showBack={true} onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Loading invitation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invitationData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Invalid Invitation" showBack={true} onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#E0E0E0" />
          <Text style={styles.errorText}>Invitation not found or expired</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/auth/welcome')}>
            <Text style={styles.retryButtonText}>Go to Login</Text>
          </TouchableOpacity>
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
          title="Complete Your Registration"
          showBack={true}
          onBack={() => router.back()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome, {formData.firstName}!</Text>
              <Text style={styles.welcomeMessage}>
                You've been invited to join as a tenant. Complete your registration below to access your tenant portal.
              </Text>
            </View>

            {/* Property & Unit Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Assignment</Text>
              <View style={styles.assignmentCard}>
                <View style={styles.assignmentRow}>
                  <MaterialIcons name="home" size={20} color={colors.secondary} />
                  <Text style={styles.assignmentLabel}>Property:</Text>
                  <Text style={styles.assignmentValue}>{invitationData.property?.name}</Text>
                </View>
                <View style={styles.assignmentRow}>
                  <MaterialIcons name="door-front" size={20} color={colors.secondary} />
                  <Text style={styles.assignmentLabel}>Unit:</Text>
                  <Text style={styles.assignmentValue}>Unit {invitationData.unit?.unitNumber}</Text>
                </View>
                <View style={styles.assignmentRow}>
                  <MaterialIcons name="attach-money" size={20} color={colors.secondary} />
                  <Text style={styles.assignmentLabel}>Rent:</Text>
                  <Text style={styles.assignmentValue}>
                    {formatCurrency(parseFloat(invitationData.unit?.rent || invitationData.monthlyRent || '0'))}
                  </Text>
                </View>
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={formData.firstName}
                    editable={false}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={formData.lastName}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Next of Kin */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Next of Kin</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Next of Kin Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter next of kin name"
                  value={formData.nextOfKinName}
                  onChangeText={(value) => handleInputChange('nextOfKinName', value)}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Next of Kin Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter next of kin phone number"
                  value={formData.nextOfKinPhone}
                  onChangeText={(value) => handleInputChange('nextOfKinPhone', value)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Password Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Create Password</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[styles.signupButton, saving && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={saving}
            >
              <MaterialIcons name="person-add" size={20} color="#fff" />
              <Text style={styles.signupButtonText}>
                {saving ? 'Creating Account...' : 'Create Account'}
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

      <CustomConfirmation
        visible={confirmationVisible}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        onConfirm={confirmationConfig.onConfirm}
        onCancel={() => setConfirmationVisible(false)}
        confirmText="Create Account"
        cancelText="Cancel"
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Outfit_500Medium',
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  welcomeMessage: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 24,
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
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  assignmentValue: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    flex: 1,
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
  disabledInput: {
    backgroundColor: '#F8F8F8',
    color: '#666',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  eyeButton: {
    padding: 12,
  },
  signupButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
});

export default TenantSignupScreen;
import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import CustomConfirmation from '../components/CustomConfirmation';

const ReportTenantScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tenantName: '',
    propertyAddress: '',
    issueType: '',
    description: '',
    urgency: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.tenantName.trim() || !formData.description.trim()) {
      setConfirmationVisible(true);
      return;
    }

    // TODO: Implement actual report submission to backend
    console.log('Submitting tenant report:', formData);
    
    // Show success and navigate back
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Tenant</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Report tenant issues or concerns to property management
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tenant Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.tenantName}
                onChangeText={(value) => handleInputChange('tenantName', value)}
                placeholder="Enter tenant's full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Address</Text>
              <TextInput
                style={styles.input}
                value={formData.propertyAddress}
                onChangeText={(value) => handleInputChange('propertyAddress', value)}
                placeholder="Enter property address"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Issue Type</Text>
              <TextInput
                style={styles.input}
                value={formData.issueType}
                onChangeText={(value) => handleInputChange('issueType', value)}
                placeholder="e.g., Late payment, Property damage, Noise complaints"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Urgency Level</Text>
              <View style={styles.urgencyContainer}>
                {['low', 'medium', 'high'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.urgencyButton,
                      formData.urgency === level && styles.urgencyButtonActive
                    ]}
                    onPress={() => handleInputChange('urgency', level)}
                  >
                    <Text style={[
                      styles.urgencyText,
                      formData.urgency === level && styles.urgencyTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomConfirmation
          visible={confirmationVisible}
          title="Missing Information"
          message="Please fill in the tenant name and description fields."
          type="warning"
          confirmText="OK"
          cancelText=""
          onConfirm={() => setConfirmationVisible(false)}
          onCancel={() => setConfirmationVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginVertical: 20,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    backgroundColor: '#fff',
    color: colors.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  urgencyText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  urgencyTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  submitButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});

export default ReportTenantScreen;
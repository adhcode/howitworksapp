import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { CustomAlert } from '../components/CustomAlert';
import CustomConfirmation from '../components/CustomConfirmation';
import { apiService } from '../services/api';

const TenantTokenScreen = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

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
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const showConfirmation = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setConfirmationConfig({ type, title, message });
    setConfirmationVisible(true);
  };

  const handleTokenSubmit = async () => {
    if (!token.trim()) {
      showConfirmation('warning', 'Token Required', 'Please enter your invitation token.');
      return;
    }

    if (token.length !== 6) {
      showConfirmation('warning', 'Invalid Token', 'Token must be 6 characters long.');
      return;
    }

    try {
      setLoading(true);

      // Validate token with backend
      const response = await apiService.validateInvitationToken(token.toUpperCase());

      // The API service returns the unwrapped data, so response is { isValid: boolean }
      if (response.isValid) {
        // Token is valid, proceed to tenant signup with token
        router.push(`/auth/tenant-signup?token=${token.toUpperCase()}`);
      } else {
        showConfirmation('error', 'Invalid Token', 'The invitation token you entered is not valid or has expired.');
      }
    } catch (error: any) {
      console.error('Token validation error:', error);
      showConfirmation('error', 'Validation Failed', 'Unable to validate token. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatToken = (text: string) => {
    // Convert to uppercase and limit to 6 characters
    return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Enter Invitation Token</Text>
            <Text style={styles.subtitle}>
              Enter the 6-character code provided by your landlord to join as a tenant
            </Text>
          </View>

          {/* Token Input */}
          <View style={styles.tokenContainer}>
            <View style={styles.tokenInputContainer}>
              <MaterialIcons name="vpn-key" size={24} color={colors.secondary} />
              <TextInput
                style={styles.tokenInput}
                placeholder="ABC123"
                value={token}
                onChangeText={(text) => setToken(formatToken(text))}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.tokenHint}>
              Token format: 6 letters and numbers (e.g., ABC123)
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, (!token || token.length !== 6) && styles.continueButtonDisabled]}
            onPress={handleTokenSubmit}
            disabled={loading || !token || token.length !== 6}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Validating...' : 'Continue'}
            </Text>
            {!loading && (
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Don't have a token? Contact your landlord to get an invitation.
            </Text>
          </View>
        </View>
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
        type={confirmationConfig.type}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setConfirmationVisible(false)}
        onCancel={() => setConfirmationVisible(false)}
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
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    lineHeight: 24,
  },
  tokenContainer: {
    marginBottom: 40,
  },
  tokenInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    gap: 12,
  },
  tokenInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    letterSpacing: 2,
  },
  tokenHint: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TenantTokenScreen;
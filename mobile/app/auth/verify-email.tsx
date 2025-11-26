import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';

const VerifyEmailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  const email = params.email as string;

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newCode.every(digit => digit !== '') && text) {
      verifyEmail(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyEmail = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address not provided');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.verifyEmailWithCode(email, codeToVerify);
      setVerified(true);
      
      Alert.alert(
        'Email Verified!',
        'Your email has been verified successfully. You can now log in.',
        [
          {
            text: 'Login',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Email verification error:', error);
      setError(error.message || 'Failed to verify email');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address not provided');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setCode(['', '', '', '', '', '']);
      await apiService.resendVerificationEmail(email);
      
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email address.',
        [{ text: 'OK' }]
      );
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Resend verification error:', error);
      Alert.alert('Error', error.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.secondary} />
          ) : verified ? (
            <MaterialIcons name="check-circle" size={80} color={colors.success} />
          ) : (
            <MaterialIcons name="email" size={80} color={colors.secondary} />
          )}
        </View>

        <Text style={styles.title}>
          {loading
            ? 'Verifying...'
            : verified
            ? 'Email Verified!'
            : 'Enter Verification Code'}
        </Text>

        <Text style={styles.message}>
          {verified
            ? 'Your email has been verified successfully. You can now log in to your account.'
            : `We sent a 6-digit verification code to ${email}. Please enter it below.`}
        </Text>

        {!verified && (
          <>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                    error && styles.codeInputError,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.buttonContainer}>
          {verified ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/auth/login')}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => verifyEmail()}
                disabled={loading || code.some(digit => !digit)}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={resendVerification}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>
                  {loading ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.replace('/auth/login')}
              >
                <Text style={styles.secondaryButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.textGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#E1E1E1',
    borderRadius: 12,
    fontSize: 24,
    fontFamily: 'Outfit_600SemiBold',
    textAlign: 'center',
    color: colors.primary,
    backgroundColor: '#fff',
  },
  codeInputFilled: {
    borderColor: colors.secondary,
    backgroundColor: '#f0f9ff',
  },
  codeInputError: {
    borderColor: colors.error,
    backgroundColor: '#fff5f5',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.error,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
});

export default VerifyEmailScreen;
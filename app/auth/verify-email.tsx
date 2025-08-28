import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  
  const token = params.token as string;
  const email = params.email as string;

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.verifyEmail(token);
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
      await apiService.resendVerificationEmail(email);
      
      Alert.alert(
        'Email Sent',
        'A new verification email has been sent to your email address.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Resend verification error:', error);
      Alert.alert('Error', error.message || 'Failed to resend verification email');
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
          ) : error ? (
            <MaterialIcons name="error" size={80} color={colors.error} />
          ) : (
            <MaterialIcons name="email" size={80} color={colors.secondary} />
          )}
        </View>

        <Text style={styles.title}>
          {loading
            ? 'Verifying Email...'
            : verified
            ? 'Email Verified!'
            : error
            ? 'Verification Failed'
            : 'Check Your Email'}
        </Text>

        <Text style={styles.message}>
          {loading
            ? 'Please wait while we verify your email address.'
            : verified
            ? 'Your email has been verified successfully. You can now log in to your account.'
            : error
            ? error
            : 'We sent a verification link to your email address. Please check your inbox and click the link to verify your account.'}
        </Text>

        <View style={styles.buttonContainer}>
          {verified ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/auth/login')}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
          ) : error ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={resendVerification}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.replace('/auth/login')}
              >
                <Text style={styles.secondaryButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={resendVerification}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Sending...' : 'Resend Email'}
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
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import CustomConfirmation from '../components/CustomConfirmation';

const ForgotPasswordScreen = () => {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Confirmation dialog state
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
    });

    const showConfirmation = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setConfirmationConfig({ type, title, message });
        setConfirmationVisible(true);
    };

    const validateEmail = () => {
        if (!email.trim()) {
            showConfirmation('error', 'Validation Error', 'Email is required');
            return false;
        }
        if (!email.includes('@')) {
            showConfirmation('error', 'Validation Error', 'Please enter a valid email');
            return false;
        }
        return true;
    };

    const validateCode = () => {
        if (!code.trim()) {
            showConfirmation('error', 'Validation Error', 'Verification code is required');
            return false;
        }
        if (code.length !== 6) {
            showConfirmation('error', 'Validation Error', 'Please enter a valid 6-digit code');
            return false;
        }
        return true;
    };

    const validatePassword = () => {
        if (!newPassword.trim()) {
            showConfirmation('error', 'Validation Error', 'Password is required');
            return false;
        }
        if (newPassword.length < 6) {
            showConfirmation('error', 'Validation Error', 'Password must be at least 6 characters');
            return false;
        }
        if (newPassword !== confirmPassword) {
            showConfirmation('error', 'Validation Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSendCode = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        try {
            await apiService.forgotPassword(email);
            setStep('code');
            showConfirmation(
                'success',
                'Code Sent!',
                'A 6-digit verification code has been sent to your email address. Please check your inbox.'
            );
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to send verification code';
            showConfirmation('error', 'Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!validateCode()) return;

        setLoading(true);
        try {
            await apiService.verifyResetCode(email, code);
            setStep('password');
        } catch (error: any) {
            const errorMessage = error.message || 'Invalid or expired code';
            showConfirmation('error', 'Verification Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!validatePassword()) return;

        setLoading(true);
        try {
            await apiService.resetPasswordWithCode(email, code, newPassword);
            showConfirmation(
                'success',
                'Success!',
                'Your password has been reset successfully. You can now log in with your new password.'
            );
            setTimeout(() => {
                router.replace('/auth/login');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to reset password';
            showConfirmation('error', 'Reset Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            await apiService.forgotPassword(email);
            showConfirmation(
                'success',
                'Code Resent!',
                'A new verification code has been sent to your email address.'
            );
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to resend code';
            showConfirmation('error', 'Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
                            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {step === 'email' && 'Forgot Password?'}
                            {step === 'code' && 'Enter Code'}
                            {step === 'password' && 'New Password'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 'email' && 'Enter your email address and we\'ll send you a verification code'}
                            {step === 'code' && 'Enter the 6-digit code sent to your email'}
                            {step === 'password' && 'Create a new password for your account'}
                        </Text>
                    </View>

                    {/* Email Step */}
                    {step === 'email' && (
                        <>
                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="Enter your email address"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            <View style={styles.spacer} />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                                    onPress={handleSendCode}
                                    disabled={loading}
                                >
                                    <Text style={styles.resetButtonText}>
                                        {loading ? 'Sending...' : 'Send Code'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.backToLoginButton}
                                    onPress={handleBackToLogin}
                                >
                                    <Text style={styles.backToLoginText}>Back to Login</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Code Verification Step */}
                    {step === 'code' && (
                        <>
                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Verification Code</Text>
                                    <TextInput
                                        style={[styles.input, styles.codeInput]}
                                        value={code}
                                        onChangeText={setCode}
                                        placeholder="000000"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!loading}
                                    />
                                </View>
                                <Text style={styles.emailText}>Code sent to: {email}</Text>
                            </View>

                            <View style={styles.spacer} />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                                    onPress={handleVerifyCode}
                                    disabled={loading}
                                >
                                    <Text style={styles.resetButtonText}>
                                        {loading ? 'Verifying...' : 'Verify Code'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.resendButton}
                                    onPress={handleResendCode}
                                    disabled={loading}
                                >
                                    <Text style={styles.resendButtonText}>Resend Code</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.backToLoginButton}
                                    onPress={handleBackToLogin}
                                >
                                    <Text style={styles.backToLoginText}>Back to Login</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* New Password Step */}
                    {step === 'password' && (
                        <>
                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholder="Enter new password"
                                            secureTextEntry={!showPassword}
                                            editable={!loading}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <MaterialIcons
                                                name={showPassword ? 'visibility' : 'visibility-off'}
                                                size={24}
                                                color="#999"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Confirm new password"
                                            secureTextEntry={!showConfirmPassword}
                                            editable={!loading}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <MaterialIcons
                                                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                                size={24}
                                                color="#999"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.spacer} />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                >
                                    <Text style={styles.resetButtonText}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.backToLoginButton}
                                    onPress={handleBackToLogin}
                                >
                                    <Text style={styles.backToLoginText}>Back to Login</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Custom Confirmation Dialog */}
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
    },
    header: {
        paddingTop: 10,
        marginBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
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
    form: {
        gap: 20,
    },
    inputContainer: {
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
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        backgroundColor: '#fff',
    },
    codeInput: {
        fontSize: 24,
        fontFamily: 'Outfit_600SemiBold',
        textAlign: 'center',
        letterSpacing: 8,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        letterSpacing: 0,
    },
    eyeIcon: {
        padding: 12,
    },
    spacer: {
        flex: 1,
    },
    buttonContainer: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    resetButton: {
        backgroundColor: colors.secondary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    resetButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
    },
    resendButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    resendButtonText: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
    },
    backToLoginButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    backToLoginText: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.secondary,
    },
    emailText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#666666',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default ForgotPasswordScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import CustomConfirmation from '../components/CustomConfirmation';

const LoginScreen = () => {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Confirmation dialog state
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const showConfirmation = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setConfirmationConfig({ type, title, message });
        setConfirmationVisible(true);
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            showConfirmation('error', 'Validation Error', 'Email is required');
            return false;
        }
        if (!formData.email.includes('@')) {
            showConfirmation('error', 'Validation Error', 'Please enter a valid email');
            return false;
        }
        if (!formData.password.trim()) {
            showConfirmation('error', 'Validation Error', 'Password is required');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            
            // Navigate based on user role
            if (user.role === 'landlord') {
                router.replace('/landlord/tabs/home');
            } else if (user.role === 'tenant') {
                router.replace('/tenant/tabs/home');
            } else {
                // Fallback to role selection if role is not set
                router.replace('/auth/role-selection');
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to login';
            
            // Check if it's an email verification error
            if (errorMessage.includes('verify your email')) {
                showConfirmation(
                    'warning', 
                    'Email Not Verified', 
                    'Please verify your email address before logging in. Check your inbox for the verification link.'
                );
                
                // Optionally navigate to verification screen
                setTimeout(() => {
                    router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
                }, 3000);
            } else {
                showConfirmation('error', 'Login Failed', errorMessage);
            }
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
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                placeholder="Enter email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={formData.password}
                                    onChangeText={(value) => handleInputChange('password', value)}
                                    placeholder="Enter password"
                                    secureTextEntry={!showPassword}
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

                        <TouchableOpacity 
                            style={styles.forgotPassword}
                            onPress={() => router.push('/auth/forgot-password')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.spacer} />

                    {/* Login Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>
                                {loading ? 'Signing In...' : 'Login'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.signupPrompt}>
                            <Text style={styles.signupPromptText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/role-selection')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    eyeButton: {
        padding: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.secondary,
    },
    spacer: {
        flex: 1,
    },
    buttonContainer: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    loginButton: {
        backgroundColor: colors.secondary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
    },
    signupPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupPromptText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#666666',
    },
    signupLink: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.secondary,
    },
});

export default LoginScreen;
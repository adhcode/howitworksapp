import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import colors from '../theme/colors';
import Header from '../components/Header';

export default function OTPVerificationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<TextInput[]>([]);

    const userEmail = 'example@email.com'; // This would come from user context/storage

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace to go to previous input
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter the complete 6-digit code');
            return;
        }

        // TODO: Verify OTP with backend
        if (params.type === 'change-password') {
            Alert.alert('Success', 'Password changed successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Success', 'Verification completed', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }
    };

    const handleResendCode = () => {
        // TODO: Resend OTP code
        Alert.alert('Code Sent', 'A new verification code has been sent to your email');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <SafeAreaView style={styles.container}>
            <Header title="OTP Verification" showBack={true} />
            <View style={styles.content}>
                <View style={styles.messageContainer}>
                    <Text style={styles.message}>
                        A 6 digit code was sent to {userEmail}, enter the code to continue.
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputRefs.current[index] = ref as TextInput}
                            style={[
                                styles.otpInput,
                                digit ? styles.otpInputFilled : null
                            ]}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            textAlign="center"
                        />
                    ))}
                </View>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't get a code? </Text>
                    <TouchableOpacity onPress={handleResendCode}>
                        <Text style={styles.resendLink}>Resend Code</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, !isOtpComplete && styles.verifyButtonDisabled]}
                    onPress={handleVerify}
                    disabled={!isOtpComplete}
                >
                    <Text style={[styles.verifyButtonText, !isOtpComplete && styles.verifyButtonTextDisabled]}>
                        Verify
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    content: {
        flex: 1,
        padding: 16
    },
    messageContainer: {
        marginBottom: 32
    },
    message: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
        lineHeight: 24
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    otpInput: {
        width: 48,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.text,
        backgroundColor: colors.card
    },
    otpInputFilled: {
        borderColor: colors.secondary
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32
    },
    resendText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray
    },
    resendLink: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.secondary
    },
    verifyButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    verifyButtonDisabled: {
        backgroundColor: colors.textGray,
        opacity: 0.5
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold'
    },
    verifyButtonTextDisabled: {
        color: '#fff',
        opacity: 0.7
    }
}); 
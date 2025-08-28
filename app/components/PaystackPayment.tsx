import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import CustomAlert from './CustomAlert';

interface PaystackPaymentProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (reference: string) => void;
    amount: number;
    email: string;
    description?: string;
    metadata?: any;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
    visible,
    onClose,
    onSuccess,
    amount,
    email,
    description,
    metadata
}) => {
    const [loading, setLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
    });

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertConfig({ type, title, message });
        setAlertVisible(true);
    };

    const handlePaymentSuccess = async (response: any) => {
        try {
            setLoading(true);

            // Verify payment with backend
            const verificationResult = await apiService.verifyPayment(response.reference);

            if (verificationResult.status && verificationResult.data.status === 'success') {
                showAlert('success', 'Payment Successful', 'Your payment has been processed successfully.');
                onSuccess(response.reference);
            } else {
                showAlert('error', 'Payment Failed', 'Payment verification failed. Please contact support.');
            }
        } catch (error: any) {
            console.error('Payment verification error:', error);
            showAlert('error', 'Verification Error', 'Unable to verify payment. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentCancel = () => {
        showAlert('warning', 'Payment Cancelled', 'Payment was cancelled by user.');
        onClose();
    };

    const paystackWebViewProps: paystackProps = {
        paystackKey: 'pk_test_your_public_key_here', // Replace with your Paystack public key
        amount: amount,
        billingEmail: email,
        billingMobile: '',
        billingName: '',
        ActivityIndicatorColor: colors.secondary,
        onCancel: handlePaymentCancel,
        onSuccess: handlePaymentSuccess,
        autoStart: true,
    };

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                transparent={false}
                onRequestClose={onClose}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Complete Payment</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Payment Details */}
                    <View style={styles.paymentDetails}>
                        <Text style={styles.amountLabel}>Amount to Pay</Text>
                        <Text style={styles.amount}>₦{amount.toLocaleString()}</Text>
                        {description && (
                            <Text style={styles.description}>{description}</Text>
                        )}
                    </View>

                    {/* Paystack WebView */}
                    {!loading && (
                        <View style={styles.webviewContainer}>
                            <Paystack {...paystackWebViewProps} />
                        </View>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.secondary} />
                            <Text style={styles.loadingText}>Verifying payment...</Text>
                        </View>
                    )}
                </View>
            </Modal>

            <CustomAlert
                visible={alertVisible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => {
                    setAlertVisible(false);
                    if (alertConfig.type === 'success') {
                        onClose();
                    }
                }}
            />
        </>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
    },
    placeholder: {
        width: 40,
    },
    paymentDetails: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    amountLabel: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginBottom: 8,
    },
    amount: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: colors.primary,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        textAlign: 'center',
    },
    webviewContainer: {
        flex: 1,
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
});

export default PaystackPayment;

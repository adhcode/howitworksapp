import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import { CustomAlert } from './CustomAlert';

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
    const [showWebView, setShowWebView] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
    });
    const webViewRef = useRef<WebView>(null);

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertConfig({ type, title, message });
        setAlertVisible(true);
    };

    const handleWebViewNavigationStateChange = async (navState: any) => {
        const { url } = navState;
        console.log('📍 WebView navigated to:', url);

        // Check if payment was completed (various Paystack success indicators)
        const isPaymentComplete =
            url.includes('success') ||
            url.includes('callback') ||
            url.includes('trxref') ||
            url.includes('reference');

        if (isPaymentComplete && !loading) {
            console.log('✅ Payment may be completed, auto-verifying...');
            await verifyPayment();
        }
    };

    const verifyPayment = async () => {
        setShowWebView(false);
        setLoading(true);

        try {
            console.log('🔍 Verifying payment reference:', paymentReference);

            // Verify payment with backend
            const verification: any = await apiService.verifyPayment(paymentReference);

            console.log('📋 Full verification result:', JSON.stringify(verification, null, 2));

            // The API wraps the response in a data object, so we need to access verification.data.data
            const verificationData = verification?.data?.data || verification?.data || verification;
            const apiStatus = verification?.data?.status ?? verification?.status;
            
            console.log('💳 Verification data:', verificationData);
            console.log('💳 API status:', apiStatus);

            // Check if verification was successful
            if (apiStatus === true || verificationData?.status === 'success') {
                const paymentStatus = verificationData?.status;
                console.log('💳 Payment status from Paystack:', paymentStatus);

                if (paymentStatus === 'success') {
                    showAlert('success', 'Payment Successful! 🎉', 'Your rent payment has been processed successfully. Your landlord has been credited.');
                    setTimeout(() => {
                        onSuccess(paymentReference);
                        onClose();
                    }, 2500);
                } else if (paymentStatus === 'failed') {
                    showAlert('error', 'Payment Failed', 'Your payment was not successful. Please try again.');
                    setTimeout(() => {
                        onClose();
                    }, 3000);
                } else {
                    showAlert('warning', 'Payment Pending', `Payment status: ${paymentStatus}. Please check your payment history.`);
                    setTimeout(() => {
                        onClose();
                    }, 3000);
                }
            } else {
                showAlert('error', 'Verification Failed', 'Unable to verify payment status. Please check your payment history.');
                setTimeout(() => {
                    onClose();
                }, 3000);
            }
        } catch (error: any) {
            console.error('❌ Verification error:', error);
            showAlert('error', 'Verification Error', 'Unable to verify payment. Please check your transaction history.');
            setTimeout(() => {
                onClose();
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiatePayment = async () => {
        try {
            setLoading(true);

            console.log('🔄 Initializing payment:', { email, amount, description, metadata });

            // Initialize payment with backend (backend has the Paystack keys)
            // Amount is in Naira, backend will convert to kobo
            const response: any = await apiService.initializePayment({
                email,
                amount, // Send amount as-is (e.g., 260000)
                description,
                metadata,
            });

            console.log('✅ Payment initialized:', response);

            if (response?.authorization_url && response?.reference) {
                setPaymentUrl(response.authorization_url);
                setPaymentReference(response.reference);
                setLoading(false);
                setShowWebView(true);
            } else {
                throw new Error('Failed to initialize payment');
            }
        } catch (error: any) {
            showAlert('error', 'Payment Error', error.message || 'Failed to initialize payment');
            setLoading(false);
        }
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

                    {/* Payment Info */}
                    {!loading && !showWebView && (
                        <View style={styles.infoContainer}>
                            <MaterialIcons name="info-outline" size={48} color={colors.secondary} />
                            <Text style={styles.infoTitle}>Secure Payment</Text>
                            <Text style={styles.infoText}>
                                You'll be taken to Paystack's secure payment page to complete your transaction safely.
                            </Text>

                            <TouchableOpacity
                                style={styles.payButton}
                                onPress={handleInitiatePayment}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.payButtonText}>Proceed to Payment</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* WebView for Payment */}
                    {showWebView && !loading && (
                        <>
                            <View style={styles.webviewContainer}>
                                <WebView
                                    ref={webViewRef}
                                    source={{ uri: paymentUrl }}
                                    onNavigationStateChange={handleWebViewNavigationStateChange}
                                    startInLoadingState={true}
                                    renderLoading={() => (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="large" color={colors.secondary} />
                                            <Text style={styles.loadingText}>Loading payment page...</Text>
                                        </View>
                                    )}
                                />
                            </View>

                            {/* Done Button */}
                            <View style={styles.doneButtonContainer}>
                                <TouchableOpacity
                                    style={styles.doneButton}
                                    onPress={verifyPayment}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="check-circle" size={24} color="#fff" />
                                    <Text style={styles.doneButtonText}>I've Completed Payment</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.secondary} />
                            <Text style={styles.loadingText}>
                                {showWebView ? 'Verifying payment...' : 'Initializing payment...'}
                            </Text>
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
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    infoTitle: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    payButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    payButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
    },
    doneButtonContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
    },
    doneButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    doneButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
        marginLeft: 8,
    },
});

export default PaystackPayment;

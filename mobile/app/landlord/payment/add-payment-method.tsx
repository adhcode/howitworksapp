import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ViewStyle, TextStyle, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import Header from '../../components/Header';

// Remove the secret key as we'll use the public key for client-side operations
const PAYSTACK_PUBLIC_KEY = 'pk_test_5a8cad7fe3a74d3e60cd3b4299a2e886f7442b4c';

interface Bank {
    id: number;
    name: string;
    code: string;
}

interface Styles {
    container: ViewStyle;
    content: ViewStyle;
    subtitle: TextStyle;
    inputContainer: ViewStyle;
    label: TextStyle;
    input: TextStyle & ViewStyle;
    continueButton: ViewStyle;
    continueButtonText: TextStyle;
    loadingContainer: ViewStyle;
    bankSelector: ViewStyle;
    bankSelectorText: TextStyle;
    modalContainer: ViewStyle;
    modalContent: ViewStyle;
    bankItem: ViewStyle;
    bankItemText: TextStyle;
    modalHeader: ViewStyle;
    modalHeaderText: TextStyle;
    closeButton: ViewStyle;
    title: TextStyle;
    button: ViewStyle;
    buttonText: TextStyle;
}

export default function AddPaymentMethodScreen() {
    const router = useRouter();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);

    useEffect(() => {
        fetchBanks();
    }, []);

    useEffect(() => {
        // Validate form
        setIsFormValid(
            selectedBank !== null &&
            accountNumber.length === 10 &&
            accountHolderName.length > 0
        );
    }, [selectedBank, accountNumber, accountHolderName]);

    const fetchBanks = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://api.paystack.co/bank', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (data.status) {
                // Sort banks alphabetically
                const sortedBanks = data.data.sort((a: Bank, b: Bank) =>
                    a.name.localeCompare(b.name)
                );
                setBanks(sortedBanks);
                console.log('Banks fetched:', sortedBanks.length);
            }
        } catch (error) {
            console.error('Error fetching banks:', error);
            Alert.alert('Error', 'Failed to fetch banks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyAccountNumber = async (accountNumberToVerify?: string) => {
        const numberToVerify = accountNumberToVerify || accountNumber;

        if (!selectedBank || numberToVerify.length !== 10) {
            console.log('Verification skipped - invalid conditions:', {
                hasBank: !!selectedBank,
                accountLength: numberToVerify.length,
                number: numberToVerify
            });
            return;
        }

        try {
            setVerifying(true);
            console.log('Starting verification for:', {
                bank: selectedBank.name,
                code: selectedBank.code,
                account: numberToVerify
            });

            const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${numberToVerify}&bank_code=${selectedBank.code}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer pk_test_5a8cad7fe3a74d3e60cd3b4299a2e886f7442b4c`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Verification response:', data);

            if (data.status) {
                setAccountHolderName(data.data.account_name);
                Alert.alert('Success', 'Account verified successfully!');
                return true;
            } else {
                setAccountHolderName('');
                Alert.alert('Verification Failed', data.message || 'Could not verify account number. Please check and try again.');
                return false;
            }
        } catch (error) {
            console.error('Error verifying account:', error);
            setAccountHolderName('');
            Alert.alert('Error', 'Failed to verify account. Please try again.');
            return false;
        } finally {
            setVerifying(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleAccountNumberChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setAccountNumber(numericText);

        // Clear account holder name when account number changes
        if (accountHolderName) {
            setAccountHolderName('');
        }

        // Immediately verify when we have a bank selected and exactly 10 digits
        if (selectedBank && numericText.length === 10) {
            console.log('Triggering verification for account:', numericText);
            verifyAccountNumber(numericText);
        }
    };

    const handleContinue = async () => {
        if (!isFormValid) return;

        try {
            setLoading(true);
            const isVerified = await verifyAccountNumber();

            if (isVerified) {
                // TODO: Save the verified account details to your backend
                router.push('/landlord/payment/withdraw-success');
            }
        } catch (error) {
            console.error('Error processing account:', error);
            Alert.alert('Error', 'Failed to process account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderBankItem = ({ item }: { item: Bank }) => (
        <TouchableOpacity
            style={styles.bankItem}
            onPress={() => {
                setSelectedBank(item);
                setShowBankModal(false);
                setAccountHolderName('');
            }}
        >
            <Text style={styles.bankItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Add Payout Method" showBack onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.secondary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Add Payout Method" showBack onBack={handleBack} />

            <View style={styles.content}>
                <Text style={styles.subtitle}>
                    The account will be set as your default payout method.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TouchableOpacity
                        style={styles.bankSelector}
                        onPress={() => setShowBankModal(true)}
                    >
                        <Text style={styles.bankSelectorText}>
                            {selectedBank ? selectedBank.name : 'Select a bank'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#98A2B3" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                        style={styles.input}
                        value={accountNumber}
                        onChangeText={handleAccountNumberChange}
                        keyboardType="numeric"
                        maxLength={10}
                        editable={!verifying}
                        placeholder="Enter 10-digit account number"
                        placeholderTextColor="#98A2B3"
                    />
                    {verifying && (
                        <ActivityIndicator
                            size="small"
                            color={colors.secondary}
                            style={{ position: 'absolute', right: 16, top: 44 }}
                        />
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Account Holder Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#F5F5F5' }]}
                        value={accountHolderName}
                        editable={false}
                        placeholder="Will be auto-filled after verification"
                        placeholderTextColor="#98A2B3"
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        (!isFormValid || verifying) && { opacity: 0.5 }
                    ]}
                    onPress={handleContinue}
                    disabled={!isFormValid || verifying}
                >
                    <Text style={styles.continueButtonText}>
                        {verifying ? 'Verifying...' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showBankModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Select Bank</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowBankModal(false)}
                            >
                                <MaterialIcons name="close" size={24} color="#98A2B3" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={banks}
                            renderItem={renderBankItem}
                            keyExtractor={(item) => `${item.code}-${item.name}`}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: colors.text,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#434953',
        marginBottom: 24,
        marginTop: -14
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#070D17',
        marginBottom: 8,
    },
    continueButton: {
        backgroundColor: colors.secondary,
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
    },
    bankSelector: {
        height: 44,
        borderWidth: 1,
        borderColor: '#E4E7EC',
        borderRadius: 8,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
    },
    bankSelectorText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#070D17',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
    },
    bankItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E7EC',
    },
    bankItemText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#070D17',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E7EC',
    },
    modalHeaderText: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: '#070D17',
    },
    closeButton: {
        padding: 4,
    },
}); 
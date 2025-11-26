import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import colors from '../../theme/colors';
import Header from '../../components/Header';

const nigeriaSvg = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1_2)">
<path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#F0F0F0"/>
<path d="M23.9999 12C23.9999 6.84043 20.7434 2.44179 16.1738 0.677246V23.3228C20.7434 21.5582 23.9999 17.1596 23.9999 12Z" fill="#6DA544"/>
<path d="M0 12C0 17.1596 3.25652 21.5582 7.82611 23.3228V0.677246C3.25652 2.44179 0 6.84043 0 12Z" fill="#6DA544"/>
</g>
<defs>
<clipPath id="clip0_1_2">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>
`;

interface Styles {
    container: ViewStyle;
    headerContainer: ViewStyle;
    headerSubtitle: TextStyle;
    withdrawableAmount: TextStyle;
    content: ViewStyle;
    inputSection: ViewStyle;
    inputLabel: TextStyle;
    amountInputContainer: ViewStyle;
    currencyPrefix: TextStyle;
    amountInput: TextStyle;
    currencyContainer: ViewStyle;
    currencyText: TextStyle;
    withdrawButton: ViewStyle;
    withdrawButtonDisabled: ViewStyle;
    withdrawButtonText: TextStyle;
    withdrawButtonTextDisabled: TextStyle;
}

export default function WithdrawScreen() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const withdrawableBalance = '₦90,000';

    const handleBack = () => {
        router.push('/landlord/tabs/payment');
    };

    const handleWithdraw = () => {
        if (amount) {
            router.push('/landlord/payment/add-payment-method');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerContainer}>
                <Header
                    title="Withdraw Funds"
                    showBack
                    onBack={handleBack}
                />
                <Text style={styles.headerSubtitle}>
                    Withdrawable Balance <Text style={styles.withdrawableAmount}>{withdrawableBalance}</Text>
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>
                        How much do you want to withdraw from your wallet?
                    </Text>
                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currencyPrefix}>₦</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor="#98A2B3"
                        />
                        <View style={styles.currencyContainer}>
                            <SvgXml xml={nigeriaSvg} width={20} height={20} />
                            <Text style={styles.currencyText}>NGN</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.withdrawButton,
                        !amount && styles.withdrawButtonDisabled
                    ]}
                    onPress={handleWithdraw}
                    disabled={!amount}
                >
                    <Text style={[
                        styles.withdrawButtonText,
                        !amount && styles.withdrawButtonTextDisabled
                    ]}>
                        Withdraw Funds
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        paddingBottom: 8,
    },
    headerSubtitle: {
        fontSize: 12,
        paddingLeft: 20,
        fontFamily: 'Outfit_400Regular',
        color: '#434953',
        marginTop: -8,
    },
    withdrawableAmount: {
        color: '#3D5CFF',
        fontFamily: 'Outfit_500Medium',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    inputSection: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#070D17',
        marginBottom: 24,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0.75,
        borderBottomColor: '#E4E7EC',
        paddingBottom: 12,
    },
    currencyPrefix: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#98A2B3',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#98A2B3',
        padding: 0,
    },
    currencyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currencyText: {
        fontSize: 12,
        fontFamily: 'Outfit_500Medium',
        color: '#98A2B3',
    },
    withdrawButton: {
        backgroundColor: colors.secondary,
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 226,
    },
    withdrawButtonDisabled: {
        backgroundColor: colors.secondary,
    },
    withdrawButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
    },
    withdrawButtonTextDisabled: {
        color: '#ffffff',
    },
}); 
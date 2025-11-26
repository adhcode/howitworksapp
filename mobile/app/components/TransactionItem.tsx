import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

const moneyInSvg = `
<svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g opacity="0.8">
<path d="M8.00133 6.00478C7.26467 6.00478 6.668 6.45278 6.668 7.00478C6.668 7.55744 7.26467 8.00478 8.00133 8.00478C8.738 8.00478 9.33467 8.45278 9.33467 9.00478C9.33467 9.55744 8.73733 10.0048 8.00133 10.0048M8.00133 6.00478C8.58133 6.00478 9.076 6.28278 9.25867 6.67144M8.00133 6.00478V5.33811M8.00133 10.0048C7.42133 10.0048 6.92667 9.72678 6.744 9.33811M8.00133 10.0048V10.6714M8.66667 1.67144H8C5.01467 1.67144 3.52133 1.67144 2.594 2.59878C1.66667 3.52611 1.66667 5.01878 1.66667 8.00544C1.66667 10.9901 1.66667 12.4834 2.594 13.4108C3.52133 14.3381 5.014 14.3381 8 14.3381C10.9853 14.3381 12.4787 14.3381 13.406 13.4108C14.3333 12.4834 14.3333 10.9908 14.3333 8.00478V7.33811M14.3253 1.66211L11.542 4.44678M10.992 2.00944L11.0713 4.07011C11.0713 4.55611 11.3613 4.85878 11.8893 4.89678L13.972 4.99478" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>
`;

export interface Transaction {
    type: 'Credit' | 'Debit';
    description: string;
    amount: string;
    date: string;
    status: 'Completed' | 'Failed' | 'Pending';
}

interface TransactionItemProps {
    transaction: Transaction;
    showBorder?: boolean;
}

interface Styles {
    container: ViewStyle;
    transactionBorder: ViewStyle;
    transactionIcon: ViewStyle;
    creditIcon: ViewStyle;
    debitIcon: ViewStyle;
    transactionInfo: ViewStyle;
    transactionHeader: ViewStyle;
    transactionDetails: ViewStyle;
    amountContainer: ViewStyle;
    transactionDescription: TextStyle;
    transactionDate: TextStyle;
    transactionAmount: TextStyle;
    transactionStatus: TextStyle;
}

export default function TransactionItem({ transaction, showBorder = true }: TransactionItemProps) {
    return (
        <View style={[styles.container, showBorder && styles.transactionBorder]}>
            <View style={[
                styles.transactionIcon,
                transaction.type === 'Credit' ? styles.creditIcon : styles.debitIcon
            ]}>
                <SvgXml
                    xml={moneyInSvg}
                    width={24}
                    height={24}
                    color={transaction.type === 'Credit' ? '#40B869' : '#F5B546'}
                />
            </View>
            <View style={styles.transactionInfo}>
                <View style={styles.transactionHeader}>
                    <View style={styles.transactionDetails}>
                        <Text style={styles.transactionDescription}>
                            {transaction.type} - {transaction.description}
                        </Text>
                        <Text style={styles.transactionDate}>{transaction.date}</Text>
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                        <Text style={styles.transactionStatus}>{transaction.status}.</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create<Styles>({
    container: {
        flexDirection: 'row',
        paddingVertical: 16,
        gap: 12,
    },
    transactionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    creditIcon: {
        backgroundColor: '#F2FFF7',
    },
    debitIcon: {
        backgroundColor: '#FEF6E7',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    transactionDetails: {
        flex: 1,
        gap: 4,
    },
    amountContainer: {
        alignItems: 'flex-end',
        gap: 4,
    },
    transactionDescription: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: '#070D17',
    },
    transactionDate: {
        marginTop: 8,
        fontSize: 10,
        fontFamily: 'Outfit_400Regular',
        color: '#434953',
    },
    transactionAmount: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: '#070D17',
    },
    transactionStatus: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: '#434953',
    },
}); 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';

interface TenantPaymentCardProps {
    data: any;
    loading: boolean;
}

const TenantPaymentCard: React.FC<TenantPaymentCardProps> = ({ data, loading }) => {
    const router = useRouter();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleMakePayment = () => {
        router.push('/tenant/tabs/wallet');
    };

    if (loading) {
        return (
            <View style={[styles.paymentCard, styles.loadingCard]}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Loading payment info...</Text>
            </View>
        );
    }

    return (
        <View style={styles.paymentCard}>
            <Text style={styles.totalDueLabel}>Total Due</Text>
            <Text style={styles.totalDueAmount}>
                {formatCurrency(data?.totalDue || 0)}
            </Text>
            <Text style={styles.dueDate}>Due: {data?.dueDate || 'N/A'}</Text>

            <TouchableOpacity style={styles.makePaymentButton} onPress={handleMakePayment}>
                <Text style={styles.makePaymentText}>Make Payment</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E1E1E1',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    loadingCard: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
        marginTop: 16,
    },
    totalDueLabel: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
        marginBottom: 8,
    },
    totalDueAmount: {
        fontSize: 36,
        fontFamily: 'Outfit_700Bold',
        color: colors.primary,
        marginBottom: 4,
    },
    dueDate: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
        marginBottom: 24,
    },
    makePaymentButton: {
        backgroundColor: colors.secondary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    makePaymentText: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
    },
});

export default TenantPaymentCard;
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import Header from '../../components/Header';
import TransactionItem, { Transaction } from '../../components/TransactionItem';

type TransactionType = 'All' | 'Credits' | 'Debits';

const transactions: Transaction[] = [
    {
        type: 'Credit',
        description: 'from Flat 1A, Harmony Apartments',
        amount: '₦250,000',
        date: 'Apr 5, 2025',
        status: 'Completed'
    },
    {
        type: 'Debit',
        description: 'to Bank',
        amount: '₦10,000',
        date: '11:20 PM Today',
        status: 'Completed'
    },
    {
        type: 'Credit',
        description: 'from Flat 1A',
        amount: '₦250,000',
        date: 'Apr 5, 2025',
        status: 'Completed'
    },
    {
        type: 'Credit',
        description: 'from Flat 1A',
        amount: '₦250,000',
        date: 'Apr 5, 2025',
        status: 'Completed'
    },
];

export default function TransactionHistoryScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<TransactionType>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const handleBack = () => {
        router.back();
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Credits') return transaction.type === 'Credit';
        if (activeFilter === 'Debits') return transaction.type === 'Debit';
        return true;
    }).filter(transaction => {
        if (!searchQuery) return true;
        return (
            transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.date.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header title="Transaction History" showBack onBack={handleBack} />

            <View style={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color="#666666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#666666"
                    />
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <View style={styles.filterGroup}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                styles.filterButtonLeft,
                                activeFilter === 'All' && styles.filterButtonActive
                            ]}
                            onPress={() => setActiveFilter('All')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                activeFilter === 'All' && styles.filterButtonTextActive
                            ]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                styles.filterButtonMiddle,
                                activeFilter === 'Credits' && styles.filterButtonActive
                            ]}
                            onPress={() => setActiveFilter('Credits')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                activeFilter === 'Credits' && styles.filterButtonTextActive
                            ]}>
                                Credits
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                styles.filterButtonRight,
                                activeFilter === 'Debits' && styles.filterButtonActive
                            ]}
                            onPress={() => setActiveFilter('Debits')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                activeFilter === 'Debits' && styles.filterButtonTextActive
                            ]}>
                                Debits
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Transactions List */}
                <ScrollView
                    style={styles.transactionsList}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredTransactions.map((transaction, index) => (
                        <TransactionItem
                            key={index}
                            transaction={transaction}
                            showBorder={index !== filteredTransactions.length - 1}
                        />
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#000000',
    },
    filtersContainer: {
        marginBottom: 20,


    },
    filterGroup: {
        flexDirection: 'row',
        borderRadius: 8,

        overflow: 'hidden',
    },
    filterButton: {
        flex: 1,
        marginVertical: 8,
        paddingVertical: 16,
        paddingHorizontal: 32,
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
    },
    filterButtonLeft: {

    },
    filterButtonMiddle: {

    },
    filterButtonRight: {
        // No border needed
    },
    filterButtonActive: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    filterButtonText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#070D17',
    },
    filterButtonTextActive: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#070D17',
    },
    transactionsList: {
        flex: 1,
    }
}); 
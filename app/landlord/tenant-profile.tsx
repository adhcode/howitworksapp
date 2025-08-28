import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

type TabType = 'payment' | 'lease' | 'messages';

interface PaymentHistoryItem {
    date: string;
    amount: string;
    status: 'Paid' | 'Unpaid';
}

const TenantProfileScreen = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('payment');

    const paymentHistory: PaymentHistoryItem[] = [
        { date: 'Mar 2025', amount: '₦250,000', status: 'Unpaid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
        { date: 'Mar 2025', amount: '₦250,000', status: 'Paid' },
    ];

    const PaymentHistory = () => (
        <View style={styles.paymentHistorySection}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.paymentTable}>
                <View style={styles.tableHeader}>
                    <View style={styles.columnDate}>
                        <Text style={styles.headerText}>Date</Text>
                    </View>
                    <View style={styles.columnAmount}>
                        <Text style={styles.headerText}>Amount</Text>
                    </View>
                    <View style={styles.columnStatus}>
                        <Text style={styles.headerText}>Status</Text>
                    </View>
                </View>
                {paymentHistory.map((payment, index) => (
                    <View key={index} style={styles.tableRow}>
                        <View style={styles.columnDate}>
                            <Text style={styles.cellText}>{payment.date}</Text>
                        </View>
                        <View style={styles.columnAmount}>
                            <Text style={styles.cellText}>{payment.amount}</Text>
                        </View>
                        <View style={styles.columnStatus}>
                            <View style={[styles.statusBadge, payment.status === 'Paid' ? styles.paidBadge : styles.unpaidBadge]}>
                                <Text style={[styles.statusText, { color: '#fff' }]}>{payment.status}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const LeaseDetails = () => (
        <View style={styles.leaseDetailsSection}>
            <Text style={styles.sectionTitle}>Lease Details</Text>
            <View style={styles.leaseDetailRow}>
                <Text style={styles.leaseLabel}>Lease Start Date</Text>
                <Text style={styles.leaseValue}>Jan 15, 2025</Text>
            </View>
            <View style={styles.leaseDetailRow}>
                <Text style={styles.leaseLabel}>Lease End Date</Text>
                <Text style={styles.leaseValue}>Jan 14, 2026</Text>
            </View>
            <View style={styles.leaseDetailRow}>
                <Text style={styles.leaseLabel}>Payment Frequency</Text>
                <Text style={styles.leaseValue}>Monthly</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.container}>
                {/* Top Bar */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back-ios" size={18} color="#222" />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Tenant Profile</Text>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatar} />
                        <Text style={styles.tenantName}>John Ade</Text>
                        <Text style={styles.propertyName}>Harmony Apartments</Text>

                        <View style={styles.infoContainer}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoLabel}>Unit/Apartment</Text>
                                <Text style={styles.infoValue}>Flat 1B</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoLabel}>Move-In Date</Text>
                                <Text style={styles.infoValue}>Jan 15, 2025</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoLabel}>Monthly Rent</Text>
                                <Text style={styles.infoValue}>₦250,000</Text>
                            </View>
                        </View>

                        {/* Navigation Tabs */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'payment' && styles.activeTab]}
                                onPress={() => setActiveTab('payment')}
                            >
                                <Text style={[styles.tabText, activeTab === 'payment' && styles.activeTabText]}>
                                    Payment
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'lease' && styles.activeTab]}
                                onPress={() => setActiveTab('lease')}
                            >
                                <Text style={[styles.tabText, activeTab === 'lease' && styles.activeTabText]}>
                                    Lease Details
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
                                onPress={() => setActiveTab('messages')}
                            >
                                <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
                                    Messages
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content Section */}
                    {activeTab === 'payment' && <PaymentHistory />}
                    {activeTab === 'lease' && <LeaseDetails />}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        paddingBottom: 0,
    },
    backBtn: {
        marginBottom: 10,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    screenTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 20,
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'flex-start',
        width: '100%',
    },
    avatar: {
        width: 80,
        height: 80,
        backgroundColor: '#E1E1E1',
        borderRadius: 12,
        marginBottom: 16,
    },
    tenantName: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 4,
    },
    propertyName: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginBottom: 16,
    },
    infoContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 24,
        gap: 24,
    },
    infoColumn: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.primary,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        padding: 4,
        width: '100%',
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: colors.secondary,
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.primary,
    },
    activeTabText: {
        color: '#FFF',
    },
    paymentHistorySection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 16,
    },
    paymentTable: {
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E1E1E1',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',

    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    columnDate: {
        width: '30%',
    },
    columnAmount: {
        width: '35%',
    },
    columnStatus: {
        width: '35%',
    },
    headerText: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: 'rgba(46, 46, 46, 0.8863)',
    },
    cellText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: 75,
        height: 30,
        overflow: 'hidden',
    },
    paidBadge: {
        backgroundColor: '#1BAD04',
    },
    unpaidBadge: {
        backgroundColor: '#FF0000',
    },
    statusText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#fff',
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    leaseDetailsSection: {
        marginTop: 24,
    },
    leaseDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    leaseLabel: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
    },
    leaseValue: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
    },
});

export default TenantProfileScreen; 
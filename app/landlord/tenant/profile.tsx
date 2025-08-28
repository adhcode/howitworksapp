import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import Header from '../../components/Header';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

type TabType = 'payment' | 'lease' | 'messages';

interface PaymentHistoryItem {
    date: string;
    amount: string;
    status: 'Paid' | 'Unpaid';
}

interface MessageItem {
    id: string;
    date: string;
    title: string;
    type: string;
    status: 'Sent' | 'Delivered' | 'Read';
    content: string;
}

const TenantProfileScreen = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('payment');

    const handleBack = () => {
        router.back();
    };

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

    const messageHistory: MessageItem[] = [
        {
            id: '1',
            date: 'Mar 15, 2024',
            title: 'Maintenance Request',
            type: 'Request',
            status: 'Read',
            content: 'The bathroom sink has been leaking for the past few days. Please send someone to fix it.'
        },
        {
            id: '2',
            date: 'Mar 10, 2024',
            title: 'Rent Payment Reminder',
            type: 'Notice',
            status: 'Delivered',
            content: 'This is a friendly reminder that your rent payment for March is due in 5 days.'
        },
        {
            id: '3',
            date: 'Mar 05, 2024',
            title: 'Property Inspection Notice',
            type: 'Notice',
            status: 'Read',
            content: 'We will be conducting our annual property inspection on March 20th between 10 AM and 2 PM.'
        },
        {
            id: '4',
            date: 'Feb 28, 2024',
            title: 'Utility Bill Update',
            type: 'Notice',
            status: 'Read',
            content: 'Your utility bill for February has been processed. Total amount: ₦25,000'
        },
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

    const handleNewMessage = () => {
        router.push({
            pathname: '/landlord/tenant-message',
            params: { returnTo: 'profile' }
        });
    };

    const handleOpenMessage = (messageId: string) => {
        router.push({
            pathname: '/landlord/tenant/message-details',
            params: { messageId, returnTo: 'profile' }
        });
    };

    const Messages = () => (
        <View style={styles.messagesSection}>
            <View style={styles.messageHeader}>
                <Text style={styles.sectionTitle}>Message History</Text>
                <TouchableOpacity
                    style={styles.newMessageButton}
                    onPress={handleNewMessage}
                >
                    <Ionicons name="create-outline" size={20} color={colors.secondary} />
                    <Text style={styles.newMessageText}>New Message</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.messageList}>
                {messageHistory.map((message, index) => (
                    <TouchableOpacity
                        key={message.id}
                        style={[
                            styles.messageItem,
                            index !== messageHistory.length - 1 && styles.messageItemBorder
                        ]}
                        onPress={() => handleOpenMessage(message.id)}
                    >
                        <View style={styles.messageIcon}>
                            <Ionicons
                                name={message.type === 'Notice' ? 'notifications-outline' : 'construct-outline'}
                                size={24}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.messageContent}>
                            <View style={styles.messageHeader}>
                                <Text style={styles.messageTitle}>{message.title}</Text>
                                <Text style={styles.messageDate}>{message.date}</Text>
                            </View>
                            <Text style={styles.messagePreview} numberOfLines={1}>
                                {message.content}
                            </Text>
                            <View style={styles.messageFooter}>
                                <View style={styles.messageType}>
                                    <Text style={styles.messageTypeText}>{message.type}</Text>
                                </View>
                                <Text style={[
                                    styles.messageStatus,
                                    { color: message.status === 'Read' ? '#1BAD04' : colors.primary }
                                ]}>
                                    {message.status}
                                </Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Tenant Profile"
                onBack={handleBack}
            />

            <ScrollView style={styles.content}>
                <View style={styles.profileSection}>
                    <Text style={styles.tenantName}>John Ade</Text>
                    <Text style={styles.unitInfo}>Flat 1B, Harmony Apartments</Text>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar} />
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
                {activeTab === 'messages' && <Messages />}
            </ScrollView>
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
    profileSection: {
        alignItems: 'flex-start',
        width: '100%',
        marginTop: 20,
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
    unitInfo: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginBottom: 16,
    },
    messagesSection: {
        marginTop: 24,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    newMessageButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    newMessageText: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.secondary,
    },
    messageList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E1E1E1',
        overflow: 'hidden',
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    messageItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    messageIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    messageContent: {
        flex: 1,
        marginRight: 12,
    },
    messageTitle: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 4,
    },
    messageDate: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
    },
    messagePreview: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginBottom: 8,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    messageType: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    messageTypeText: {
        fontSize: 12,
        fontFamily: 'Outfit_500Medium',
        color: colors.primary,
    },
    messageStatus: {
        fontSize: 12,
        fontFamily: 'Outfit_500Medium',
    },
});

export default TenantProfileScreen; 
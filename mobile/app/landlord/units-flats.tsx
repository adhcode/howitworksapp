import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';

const units = [
    {
        name: 'Flat 1A',
        id: 'FLAT-1A',
        tenant: 'John Ade',
        status: 'Occupied',
        rent: '₦250,000/month',
        action: 'View details',
        actionType: 'view',
        tenantPhone: '+234 123 456 789',
        moveInDate: 'Feb 15, 2025'
    },
    {
        name: 'Flat 1B',
        id: 'FLAT-1B',
        tenant: 'Sarah Mohammed',
        status: 'Occupied',
        rent: '₦250,000/month',
        action: 'View details',
        actionType: 'view',
        tenantPhone: '+234 987 654 321',
        moveInDate: 'Jan 10, 2025'
    },
    {
        name: 'Flat 2A',
        id: 'FLAT-2A',
        tenant: '-',
        status: 'Vacant',
        rent: '₦250,000/month',
        action: 'Assign Tenant',
        actionType: 'assign',
        tenantPhone: '',
        moveInDate: ''
    },
    {
        name: 'Flat 2B',
        id: 'FLAT-2B',
        tenant: 'Mike Johnson',
        status: 'Occupied',
        rent: '₦275,000/month',
        action: 'View details',
        actionType: 'view',
        tenantPhone: '+234 555 123 456',
        moveInDate: 'Mar 1, 2025'
    },
];

const UnitsFlatsScreen = () => {
    const router = useRouter();

    const handleBack = () => {
        router.push('/landlord/property-details');
    };

    const handleUnitAction = (unit: typeof units[0]) => {
        if (unit.actionType === 'assign') {
            router.push('/landlord/assign-tenant');
        } else {
            router.push('/landlord/tenant/profile');
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'Occupied' ? '#40B869' : '#F79009';
    };

    const getStatusBgColor = (status: string) => {
        return status === 'Occupied' ? '#E8F5E8' : '#FEF3E8';
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Units & Flats"
                subtitle="Harmony Apartments"
                showBack={true}
                onBack={handleBack}
            />

            <View style={styles.content}>
                {/* Summary Stats */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>6</Text>
                            <Text style={styles.summaryLabel}>Total Units</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: '#40B869' }]}>4</Text>
                            <Text style={styles.summaryLabel}>Occupied</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: '#F79009' }]}>2</Text>
                            <Text style={styles.summaryLabel}>Vacant</Text>
                        </View>
                    </View>
                </View>

                {/* Units List */}
                <ScrollView style={styles.unitsList} showsVerticalScrollIndicator={false}>
                    {units.map((unit, index) => (
                        <View key={unit.id} style={styles.unitCard}>
                            <View style={styles.unitHeader}>
                                <View style={styles.unitInfo}>
                                    <Text style={styles.unitName}>{unit.name}</Text>
                                    <Text style={styles.unitId}>ID: {unit.id}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusBgColor(unit.status) }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: getStatusColor(unit.status) }
                                    ]}>
                                        {unit.status}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.unitDetails}>
                                <View style={styles.detailRow}>
                                    <MaterialIcons name="person" size={16} color={colors.textGray} />
                                    <Text style={styles.detailText}>
                                        {unit.tenant || 'No tenant assigned'}
                                    </Text>
                                </View>

                                {unit.tenantPhone && (
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="phone" size={16} color={colors.textGray} />
                                        <Text style={styles.detailText}>{unit.tenantPhone}</Text>
                                    </View>
                                )}

                                <View style={styles.detailRow}>
                                    <MaterialIcons name="payments" size={16} color={colors.textGray} />
                                    <Text style={styles.detailText}>{unit.rent}</Text>
                                </View>

                                {unit.moveInDate && (
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="event" size={16} color={colors.textGray} />
                                        <Text style={styles.detailText}>Move-in: {unit.moveInDate}</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    unit.actionType === 'assign' ? styles.assignButton : styles.viewButton
                                ]}
                                onPress={() => handleUnitAction(unit)}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons
                                    name={unit.actionType === 'assign' ? 'person-add' : 'visibility'}
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.actionButtonText}>{unit.action}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                {/* Add Unit Button */}
                <TouchableOpacity
                    style={styles.addUnitButton}
                    onPress={() => router.push('/landlord/add-unit')}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="add" size={20} color="#fff" />
                    <Text style={styles.addUnitButtonText}>Add New Unit</Text>
                </TouchableOpacity>
            </View>
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
        padding: 20,
    },
    summaryCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        color: colors.secondary,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
    },
    unitsList: {
        flex: 1,
        marginBottom: 20,
    },
    unitCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    unitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    unitInfo: {
        flex: 1,
    },
    unitName: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 2,
    },
    unitId: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Outfit_500Medium',
    },
    unitDetails: {
        marginBottom: 16,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    viewButton: {
        backgroundColor: colors.secondary,
    },
    assignButton: {
        backgroundColor: '#40B869',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
    },
    addUnitButton: {
        backgroundColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        gap: 8,
    },
    addUnitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
    },
});

export default UnitsFlatsScreen; 
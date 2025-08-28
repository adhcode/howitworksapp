import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export const BottomTabBar = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/landlord/dashboard')}
            >
                <Ionicons
                    name="home-outline"
                    size={24}
                    color={pathname.includes('dashboard') ? colors.primary : '#666'}
                />
                <Text style={[styles.tabText, pathname.includes('dashboard') && styles.activeText]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/landlord/property')}
            >
                <MaterialCommunityIcons
                    name="home-city-outline"
                    size={24}
                    color={pathname.includes('property') ? colors.primary : '#666'}
                />
                <Text style={[styles.tabText, pathname.includes('property') && styles.activeText]}>Property</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/landlord/tenant-management')}
            >
                <Ionicons
                    name="people-outline"
                    size={24}
                    color={pathname.includes('tenant') ? colors.primary : '#666'}
                />
                <Text style={[styles.tabText, pathname.includes('tenant') && styles.activeText]}>Tenant</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/landlord/payment')}
            >
                <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={24}
                    color={pathname.includes('payment') ? colors.primary : '#666'}
                />
                <Text style={[styles.tabText, pathname.includes('payment') && styles.activeText]}>Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => router.push('/landlord/profile')}
            >
                <Ionicons
                    name="person-outline"
                    size={24}
                    color={pathname.includes('profile') ? colors.primary : '#666'}
                />
                <Text style={[styles.tabText, pathname.includes('profile') && styles.activeText]}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingBottom: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
        marginTop: 4,
    },
    activeText: {
        color: colors.primary,
        fontFamily: 'Outfit_600SemiBold',
    },
});

export default BottomTabBar; 
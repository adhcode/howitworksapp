import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import PropertyCard from '../components/landlord/PropertyCard';
import colors from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Header';

const PropertyScreen = () => {
    const router = useRouter();
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.container}>
                <Header
                    title="Property Management"
                    showBack={true}
                />
                <View style={styles.content}>
                    <Text style={styles.subheading}>Manage all your listed properties</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/landlord/add-property?from=property')}>
                        <Text style={styles.addBtnIcon}>＋</Text>
                        <Text style={styles.addBtnText}>Add New Property</Text>
                    </TouchableOpacity>
                    <PropertyCard
                        image={require('../assets/images/house.png')}
                        name="Harmony Apartments"
                        address="5B, Ikoyi Crescent, Lagos"
                        units="06"
                        occupied="05"
                        vacant="01"
                        rent="₦1,250,000"
                        onPressDetails={() => router.push('/landlord/property-details')}
                    />
                </View>
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
    subheading: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: '#2E2E2E',
        marginBottom: 16,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    addBtnIcon: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.secondary,
        marginRight: 6,
    },
    addBtnText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 14,
        color: colors.secondary,
    },
});

export default PropertyScreen; 
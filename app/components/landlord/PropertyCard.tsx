import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';
import colors from '../../theme/colors';
import typography from '../../theme/typography';

interface PropertyCardProps {
    image: any;
    name: string;
    address: string;
    units: string;
    occupied: string;
    vacant: string;
    rent: string;
    onPressDetails?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
    image,
    name,
    address,
    units,
    occupied,
    vacant,
    rent,
    onPressDetails,
}) => (
    <Card style={styles.card}>
        <View style={styles.column}>
            <Image source={image} style={styles.image} />
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.address}>{address}</Text>
            <View style={styles.statsRow}>
                <View style={styles.stat}><Text style={styles.statLabel}>Units</Text><Text style={styles.statValue}>{units}</Text></View>
                <View style={styles.stat}><Text style={styles.statLabel}>Occupied</Text><Text style={styles.statValue}>{occupied}</Text></View>
                <View style={styles.stat}><Text style={styles.statLabel}>Vacant</Text><Text style={styles.statValue}>{vacant}</Text></View>
                <View style={styles.stat}><Text style={styles.statLabel}>Monthly Rent</Text><Text style={styles.statValue}>{rent}</Text></View>
            </View>
            <TouchableOpacity onPress={onPressDetails} style={styles.detailsBtn}>
                <Text style={styles.detailsText}>View Details</Text>
                <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
        </View>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 4,
        borderWidth: 0,
        backgroundColor: '#FAFAFA',
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: colors.cardBorder,
    },
    name: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.primary,
        marginBottom: 2,
        textAlign: 'left',
    },
    address: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        textAlign: 'left',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    stat: {
        alignItems: 'flex-start',
        minWidth: 60,
    },
    statLabel: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 10,
        color: '#666',
    },
    statValue: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 12,
        color: colors.primary,
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    detailsText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 14,
        color: colors.secondary,
        marginRight: 4,
    },
    arrow: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 24,
        color: colors.secondary,
    },
});

export default PropertyCard; 
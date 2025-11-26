import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import { useRouter } from 'expo-router';

const CONTAINER_WIDTH = 343;

const QuickActions = () => {
    const router = useRouter();
    const actions = [
        {
            title: 'Add New Property',
            description: 'Upload property name, address, units',
            icon: 'home-work',
            onPress: () => { router.push('/landlord/add-property?from=home'); },
        },
        {
            title: 'Add New Tenant',
            description: 'Assign to unit, generate token',
            icon: 'person-add',
            onPress: () => { router.push('/landlord/add-tenant'); },
        },
        {
            title: 'View Maintenance',
            description: 'Manage property maintenance requests',
            icon: 'build',
            onPress: () => { router.push('/landlord/maintenance'); },
        },
    ];
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Quick Actions</Text>
            {actions.map((action, idx) => (
                <TouchableOpacity
                    key={action.title}
                    style={[styles.actionRow, idx !== actions.length - 1 && styles.actionRowBorder]}
                    onPress={action.onPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons name={action.icon as any} size={20} color={colors.secondary} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{action.title}</Text>
                        <Text style={styles.description}>{action.description}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CONTAINER_WIDTH,
        alignSelf: 'center',
        marginBottom: 32,
    },
    heading: {
        ...typography.heading,
        color: colors.text,
        marginBottom: 12,
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 16,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E1E1E1',
      
        
    },
    actionRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.secondary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 14,
        lineHeight: 18,
        color: colors.primary,
        marginBottom: 4,
    },
    description: {
        color: colors.text,
        opacity: 0.7,
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        lineHeight: 16,
    },
});

export default QuickActions; 
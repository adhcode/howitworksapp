import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import Avatar from '../shared/Avatar';
import NotificationBell from '../shared/NotificationBell';

interface TenantGreetingHeaderProps {
    user: any;
    tenantData: any;
}

const TenantGreetingHeader: React.FC<TenantGreetingHeaderProps> = ({ user, tenantData }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || 'User';

    return (
        <View style={styles.container}>
            {/* Header with greeting and notification */}
            <View style={styles.header}>
                <View style={styles.greetingSection}>
                    <Avatar size={48} user={user} />
                    <View style={styles.greetingText}>
                        <Text style={styles.hello}>{getGreeting()},</Text>
                        <Text style={styles.userName}>{displayName}</Text>
                    </View>
                </View>
                <NotificationBell size={44} />
            </View>

            {/* Property Info */}
            {tenantData?.property && (
                <View style={styles.propertySection}>
                    <MaterialIcons name="business" size={20} color={colors.secondary} />
                    <Text style={styles.propertyText}>
                        {tenantData.property.name}, {tenantData.property.unit}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    greetingText: {
        marginLeft: 12,
        flex: 1,
    },
    hello: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#666666',
        marginBottom: 2,
    },
    userName: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
    },
    propertySection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    propertyText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.primary,
        flex: 1,
    },
});

export default TenantGreetingHeader; 
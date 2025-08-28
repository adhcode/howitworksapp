import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Update these paths based on your project structure
const colors = {
    primary: '#2563EB',
    secondary: '#3B82F6',
    background: '#FFFFFF',
    text: '#111827',
    textGray: '#6B7280',
    card: '#FFFFFF',
    border: '#E5E7EB'
};

interface MenuItem {
    title: string;
    onPress: () => void;
    icon?: 'chevron-right';
    isPrimary?: boolean;
}

export default function ProfileScreen() {
    const router = useRouter();

    const menuItems: MenuItem[] = [
        {
            title: 'Edit Profile',
            onPress: () => router.push('/profile/edit'),
            isPrimary: true
        },
        {
            title: 'Help & Support',
            onPress: () => router.push('/profile/support'),
            icon: 'chevron-right'
        },
        {
            title: 'Change Password',
            onPress: () => router.push('/profile/change-password'),
            icon: 'chevron-right'
        },
        {
            title: 'Log Out',
            onPress: () => {
                Alert.alert(
                    'Log Out',
                    'Are you sure you want to log out?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        },
                        {
                            text: 'Log Out',
                            style: 'destructive',
                            onPress: () => {
                                // TODO: Handle logout
                                router.replace('/auth/login');
                            }
                        }
                    ]
                );
            },
            icon: 'chevron-right'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <MaterialIcons
                            name="account-circle"
                            size={80}
                            color={colors.textGray}
                        />
                    </View>
                    <Text style={styles.name}>Rokeeb Abdul</Text>
                    <Text style={styles.role}>Landlord</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.title}
                            style={[
                                styles.menuItem,
                                item.isPrimary && styles.primaryButton,
                                index !== menuItems.length - 1 && styles.menuItemBorder
                            ]}
                            onPress={item.onPress}
                        >
                            <Text style={[
                                styles.menuItemText,
                                item.isPrimary && styles.primaryButtonText
                            ]}>
                                {item.title}
                            </Text>
                            {item.icon && (
                                <MaterialIcons
                                    name={item.icon}
                                    size={24}
                                    color={colors.textGray}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/landlord')}
                >
                    <MaterialIcons name="home" size={24} color={colors.textGray} />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/landlord/property')}
                >
                    <MaterialIcons name="business" size={24} color={colors.textGray} />
                    <Text style={styles.navText}>Property</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/landlord/tenant')}
                >
                    <MaterialIcons name="people" size={24} color={colors.textGray} />
                    <Text style={styles.navText}>Tenant</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/landlord/payment')}
                >
                    <MaterialIcons name="payment" size={24} color={colors.textGray} />
                    <Text style={styles.navText}>Payment</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navItem, styles.activeNavItem]}
                >
                    <MaterialIcons name="person" size={24} color={colors.primary} />
                    <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    content: {
        flex: 1,
        padding: 16
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32
    },
    avatarContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4
    },
    role: {
        fontSize: 14,
        color: colors.textGray
    },
    menuContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        overflow: 'hidden'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: colors.card
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    menuItemText: {
        fontSize: 16,
        color: colors.text
    },
    primaryButton: {
        backgroundColor: colors.primary,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        padding: 14
    },
    primaryButtonText: {
        color: colors.background,
        fontWeight: '600',
        textAlign: 'center',
        width: '100%'
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4
    },
    activeNavItem: {
        opacity: 1
    },
    navText: {
        fontSize: 12,
        color: colors.textGray,
        marginTop: 4
    },
    activeNavText: {
        color: colors.primary
    }
}); 
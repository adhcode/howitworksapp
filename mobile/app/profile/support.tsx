import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const colors = {
    primary: '#2563EB',
    secondary: '#3B82F6',
    background: '#FFFFFF',
    text: '#111827',
    textGray: '#6B7280',
    card: '#FFFFFF',
    border: '#E5E7EB'
};

interface SupportItem {
    title: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
}

export default function SupportScreen() {
    const router = useRouter();

    const supportItems: SupportItem[] = [
        {
            title: 'Contact Support',
            description: 'Get help from our support team',
            icon: 'headset-mic',
            onPress: () => Linking.openURL('mailto:support@homezy.com')
        },
        {
            title: 'FAQs',
            description: 'Find answers to common questions',
            icon: 'help-outline',
            onPress: () => router.push('/profile/support/faqs')
        },
        {
            title: 'Terms of Service',
            description: 'Read our terms of service',
            icon: 'description',
            onPress: () => router.push('/profile/support/terms')
        },
        {
            title: 'Privacy Policy',
            description: 'View our privacy policy',
            icon: 'privacy-tip',
            onPress: () => router.push('/profile/support/privacy')
        },
        {
            title: 'Rate Us',
            description: 'Rate us on the App Store',
            icon: 'star-outline',
            onPress: () => {
                // TODO: Add appropriate store links
                Linking.openURL('https://apps.apple.com');
            }
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.subtitle}>
                    How can we help you today?
                </Text>

                <View style={styles.supportContainer}>
                    {supportItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.title}
                            style={[
                                styles.supportItem,
                                index !== supportItems.length - 1 && styles.itemBorder
                            ]}
                            onPress={item.onPress}
                        >
                            <View style={styles.iconContainer}>
                                <MaterialIcons name={item.icon} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={colors.textGray} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text
    },
    content: {
        flex: 1
    },
    subtitle: {
        fontSize: 16,
        color: colors.textGray,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 24
    },
    supportContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        marginHorizontal: 16,
        overflow: 'hidden'
    },
    supportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    textContainer: {
        flex: 1
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4
    },
    itemDescription: {
        fontSize: 14,
        color: colors.textGray
    }
}); 
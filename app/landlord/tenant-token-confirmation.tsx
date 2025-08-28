import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';

const TenantTokenConfirmationScreen = () => {
    const router = useRouter();
    const token = 'HMZ-1B-2024';
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await Clipboard.setStringAsync(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Tenant Token: ${token}`,
            });
        } catch (error) {
            // Optionally handle error
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.container}>
                <Header title="Tenant Token Generated Successfully" />
                <Text style={styles.subheading}>Token Info</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tenant Name</Text>
                        <Text style={styles.value}>David Obi</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Property</Text>
                        <Text style={styles.value}>Harmony Estate Apartments</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Property Address</Text>
                        <Text style={styles.value}>17B Emmanuel Street, Lekki Phase 1, Lagos, Nigeria</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Unit / Apartment Details</Text>
                        <Text style={styles.value}>Block A, Flat 2B</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Token</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.value}>{token}</Text>
                            <TouchableOpacity onPress={handleCopy} style={{ marginLeft: 6 }}>
                                <MaterialIcons name="content-copy" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        {copied && <Text style={styles.copiedText}>Copied!</Text>}
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Valid Until</Text>
                        <Text style={styles.value}>April 30, 2025 (14 days validity)</Text>
                    </View>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                        <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                        <Text style={styles.shareBtnText}>Share Token</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
    },
    subheading: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E1E1E1',
    },
    row: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
    },
    copiedText: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: colors.secondary,
        marginTop: 4,
    },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    doneBtn: { backgroundColor: '#fff', borderRadius: 6, paddingVertical: 14, paddingHorizontal: 32, borderWidth: 1, borderColor: '#E1E1E1', flex: 1, marginRight: 8, alignItems: 'center' },
    doneBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: colors.primary },
    shareBtn: { backgroundColor: colors.secondary, borderRadius: 6, paddingVertical: 14, paddingHorizontal: 32, flex: 1, marginLeft: 8, alignItems: 'center' },
    shareBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
});

export default TenantTokenConfirmationScreen; 
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';

const paymentFrequencies = ['Monthly', 'Quarterly', 'Yearly'];

const AssignTenantScreen = () => {
    const router = useRouter();
    const [tenantName, setTenantName] = useState('');
    const [rent, setRent] = useState('');
    const [paymentFrequency, setPaymentFrequency] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [moveInDate, setMoveInDate] = useState('');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.container}>
                    <Header title="Assign Tenant to Flat 1B" />
                    <Pressable style={{ flex: 1 }} onPress={() => dropdownOpen && setDropdownOpen(false)}>
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.form}>
                                <Text style={styles.label}>Tenant Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={tenantName}
                                    onChangeText={setTenantName}
                                    placeholder="Enter Tenant Full Name"
                                    placeholderTextColor="#B0B0B0"
                                />
                                <Text style={styles.label}>Rent Amount (₦)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={rent}
                                    onChangeText={setRent}
                                    placeholder="0000"
                                    placeholderTextColor="#B0B0B0"
                                    keyboardType="numeric"
                                />
                                <Text style={styles.label}>Payment Frequency</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    activeOpacity={0.7}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setDropdownOpen(!dropdownOpen);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                        <Text style={paymentFrequency ? styles.inputText : styles.inputPlaceholder}>
                                            {paymentFrequency ? paymentFrequency : 'Select'}
                                        </Text>
                                        <MaterialIcons name="expand-more" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                    </View>
                                </TouchableOpacity>
                                {dropdownOpen && (
                                    <Pressable style={styles.dropdownList} onPress={(e) => e.stopPropagation()}>
                                        {paymentFrequencies.map((freq) => (
                                            <TouchableOpacity
                                                key={freq}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setPaymentFrequency(freq);
                                                    setDropdownOpen(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownText}>{freq}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </Pressable>
                                )}
                                <Text style={styles.label}>Move-In Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={moveInDate}
                                    onChangeText={setMoveInDate}
                                    placeholder="Enter Date"
                                    placeholderTextColor="#B0B0B0"
                                />
                            </View>
                        </ScrollView>
                    </Pressable>
                    <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/landlord/tenant-token-confirmation')}>
                        <Text style={styles.addBtnText}>Generate Tenant Token</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    form: { width: '100%', marginBottom: 24 },
    label: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: '#2E2E2E',
        marginBottom: 8,
        marginTop: 12
    },
    input: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        minHeight: 48,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        backgroundColor: '#fff',
        justifyContent: 'center',
        marginBottom: 0,
    },
    inputText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#666666',
        flex: 1,
    },
    inputPlaceholder: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#B0B0B0',
        flex: 1,
    },
    dropdownList: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 6,
        marginTop: 2,
        marginBottom: 8,
        width: '100%',
        zIndex: 10,
        position: 'absolute',
        top: 200,
        left: 0,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
    },
    addBtn: {
        backgroundColor: colors.secondary,
        borderRadius: 6,
        paddingVertical: 14,
        alignItems: 'center',
        width: '100%',
    },
    addBtnText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: '#fff',
    },
});

export default AssignTenantScreen; 
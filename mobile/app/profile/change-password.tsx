import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
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

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleSave = () => {
        // Basic validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        // TODO: Implement password change logic
        Alert.alert('Success', 'Password changed successfully', [
            {
                text: 'OK',
                onPress: () => router.back()
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={formData.currentPassword}
                                onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                                placeholder="Enter current password"
                                secureTextEntry={!showPasswords.current}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            >
                                <MaterialIcons
                                    name={showPasswords.current ? 'visibility' : 'visibility-off'}
                                    size={24}
                                    color={colors.textGray}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={formData.newPassword}
                                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                                placeholder="Enter new password"
                                secureTextEntry={!showPasswords.new}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            >
                                <MaterialIcons
                                    name={showPasswords.new ? 'visibility' : 'visibility-off'}
                                    size={24}
                                    color={colors.textGray}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={formData.confirmPassword}
                                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                placeholder="Confirm new password"
                                secureTextEntry={!showPasswords.confirm}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            >
                                <MaterialIcons
                                    name={showPasswords.confirm ? 'visibility' : 'visibility-off'}
                                    size={24}
                                    color={colors.textGray}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
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
    saveButton: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600'
    },
    content: {
        flex: 1,
        padding: 16
    },
    formContainer: {
        marginTop: 16
    },
    inputContainer: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        color: colors.textGray,
        marginBottom: 8
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingRight: 12
    },
    passwordInput: {
        flex: 1,
        height: 48,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.text
    }
}); 
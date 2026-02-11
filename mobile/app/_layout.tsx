import { Stack } from 'expo-router';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import colors from './theme/colors';

// Component to handle the integration between auth and notifications
const NotificationAuthIntegration = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    const { loadNotifications, clearUserNotifications } = useNotifications();

    useEffect(() => {
        if (!isLoading) {
            if (user?.id) {
                // User is logged in, load their notifications
                loadNotifications(user.id);
            } else {
                // User is logged out, clear notifications from memory (but keep in storage)
                clearUserNotifications();
            }
        }
    }, [user?.id, isLoading, loadNotifications, clearUserNotifications]);

    return <>{children}</>;
};

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Loading Property HomeCare...</Text>
            </View>
        );
    }

    return (
        <AuthProvider>
            <NotificationProvider>
                <NotificationAuthIntegration>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="splash" />
                        <Stack.Screen name="auth/welcome" />
                        <Stack.Screen name="auth/role-selection" />
                        <Stack.Screen name="auth/tenant-token" />
                        <Stack.Screen name="auth/signup" />
                        <Stack.Screen name="auth/login" />
                        <Stack.Screen name="auth/verify-email" />
                        <Stack.Screen
                            name="landlord"
                            options={{
                                headerShown: false,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen name="landlord/send-notice" />
                        <Stack.Screen
                            name="landlord/property-details"
                            options={{
                                headerShown: false,
                                gestureEnabled: false,
                                animationTypeForReplace: 'push',
                            }}
                        />
                        <Stack.Screen
                            name="landlord/edit-property"
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                            }}
                        />
                        <Stack.Screen
                            name="landlord/add-unit"
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                            }}
                        />
                        <Stack.Screen
                            name="landlord/add-tenant"
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                            }}
                        />
                        <Stack.Screen
                            name="landlord/unit-details"
                            options={{
                                headerShown: false,
                                presentation: 'card',
                            }}
                        />
                        <Stack.Screen
                            name="landlord/edit-unit"
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                            }}
                        />
                        <Stack.Screen
                            name="landlord/tenant-invitation-success"
                            options={{
                                headerShown: false,
                                presentation: 'modal',
                            }}
                        />
                        <Stack.Screen
                            name="auth/tenant-signup"
                            options={{
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="landlord/tenant-list"
                            options={{
                                headerShown: false,
                                presentation: 'card',
                            }}
                        />
                        <Stack.Screen
                            name="tenant"
                            options={{
                                headerShown: false,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen name="tenant-screens/submit-complaint" />
                        <Stack.Screen name="tenant-screens/messages" />
                        <Stack.Screen name="profile" />
                    </Stack>
                </NotificationAuthIntegration>
            </NotificationProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: colors.text,
    },
}); 
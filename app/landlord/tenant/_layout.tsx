import { Stack } from 'expo-router';

export default function TenantLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="profile" />
        </Stack>
    );
} 
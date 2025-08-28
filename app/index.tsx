import { Redirect } from 'expo-router';

export default function App() {
    // Redirect to splash screen on app start
    return <Redirect href="/splash" />;
}
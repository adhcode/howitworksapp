import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/landlord/tabs/home');
    }, []);
    return null;
} 
import { Slot } from 'expo-router';
import { PropertyProvider } from '../context/PropertyContext';

export default function LandlordLayout() {
    return (
        <PropertyProvider>
            <Slot />
        </PropertyProvider>
    );
} 
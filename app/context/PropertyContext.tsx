import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Property {
    id: string;
    name: string;
    address: string;
    state: string;
    city: string;
    propertyType: string;
    units: string;
    image?: string;
}

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Property) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const usePropertyContext = () => {
    const ctx = useContext(PropertyContext);
    if (!ctx) throw new Error('usePropertyContext must be used within PropertyProvider');
    return ctx;
};

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
    const [properties, setProperties] = useState<Property[]>([]);

    const addProperty = (property: Property) => {
        setProperties(prev => [...prev, { ...property, id: Date.now().toString() }]);
    };

    return (
        <PropertyContext.Provider value={{ properties, addProperty }}>
            {children}
        </PropertyContext.Provider>
    );
};

export default PropertyProvider; 
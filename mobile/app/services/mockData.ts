import { Property } from '../types/api';

// Shared mock data for properties
export const mockProperties: Record<string, Property> = {
  '1': {
    id: '1',
    landlordId: 'user-id',
    name: 'Harmony Apartments',
    address: '5B, Ikoyi Crescent',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    propertyType: 'apartment',
    description: 'Modern apartment complex with great amenities and excellent location. This property features contemporary design, premium finishes, and is located in one of Lagos\' most desirable neighborhoods.',
    totalUnits: 6,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Generator', 'Water Supply', 'Internet'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRent: 1250000,
    occupiedUnits: 4,
    vacantUnits: 2,
  },
  '2': {
    id: '2',
    landlordId: 'user-id',
    name: 'Sunset Villas',
    address: '12 Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    propertyType: 'house',
    description: 'Luxury villas with ocean view and premium amenities. Perfect for families looking for spacious living with modern conveniences and beautiful surroundings.',
    totalUnits: 4,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    amenities: ['Ocean View', 'Garden', 'Security', 'Parking', 'Swimming Pool'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRent: 800000,
    occupiedUnits: 3,
    vacantUnits: 1,
  },
  '3': {
    id: '3',
    landlordId: 'user-id',
    name: 'Golden Heights',
    address: '45 Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    propertyType: 'apartment',
    description: 'Premium high-rise apartments with stunning city views. Features state-of-the-art facilities and is located in the heart of Lekki business district.',
    totalUnits: 8,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
    ],
    amenities: ['Elevator', 'Gym', 'Parking', 'Security', 'Generator', 'Swimming Pool', 'Rooftop Terrace'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monthlyRent: 2100000,
    occupiedUnits: 6,
    vacantUnits: 2,
  }
};

// Mock units data for each property
export const mockUnitsData: Record<string, any[]> = {
  '1': [
    { id: '1', unitNumber: '1A', bedrooms: 2, bathrooms: 2, rent: 250000, isAvailable: false, status: 'occupied' },
    { id: '2', unitNumber: '1B', bedrooms: 2, bathrooms: 2, rent: 250000, isAvailable: true, status: 'vacant' },
    { id: '3', unitNumber: '2A', bedrooms: 3, bathrooms: 2.5, rent: 350000, isAvailable: false, status: 'occupied' },
    { id: '4', unitNumber: '2B', bedrooms: 3, bathrooms: 2.5, rent: 350000, isAvailable: true, status: 'vacant' },
    { id: '5', unitNumber: '3A', bedrooms: 1, bathrooms: 1, rent: 180000, isAvailable: false, status: 'occupied' },
    { id: '6', unitNumber: '3B', bedrooms: 1, bathrooms: 1, rent: 180000, isAvailable: false, status: 'occupied' },
  ],
  '2': [
    { id: '7', unitNumber: 'Villa A', bedrooms: 4, bathrooms: 3, rent: 400000, isAvailable: false, status: 'occupied' },
    { id: '8', unitNumber: 'Villa B', bedrooms: 3, bathrooms: 2.5, rent: 350000, isAvailable: false, status: 'occupied' },
    { id: '9', unitNumber: 'Villa C', bedrooms: 2, bathrooms: 2, rent: 300000, isAvailable: false, status: 'occupied' },
    { id: '10', unitNumber: 'Villa D', bedrooms: 3, bathrooms: 2.5, rent: 350000, isAvailable: true, status: 'vacant' },
  ],
  '3': [
    { id: '11', unitNumber: '10A', bedrooms: 3, bathrooms: 2.5, rent: 400000, isAvailable: false, status: 'occupied' },
    { id: '12', unitNumber: '10B', bedrooms: 3, bathrooms: 2.5, rent: 400000, isAvailable: false, status: 'occupied' },
    { id: '13', unitNumber: '11A', bedrooms: 2, bathrooms: 2, rent: 300000, isAvailable: false, status: 'occupied' },
    { id: '14', unitNumber: '11B', bedrooms: 2, bathrooms: 2, rent: 300000, isAvailable: true, status: 'vacant' },
    { id: '15', unitNumber: '12A', bedrooms: 4, bathrooms: 3, rent: 500000, isAvailable: false, status: 'occupied' },
    { id: '16', unitNumber: '12B', bedrooms: 4, bathrooms: 3, rent: 500000, isAvailable: false, status: 'occupied' },
    { id: '17', unitNumber: '13A', bedrooms: 1, bathrooms: 1, rent: 200000, isAvailable: false, status: 'occupied' },
    { id: '18', unitNumber: '13B', bedrooms: 1, bathrooms: 1, rent: 200000, isAvailable: true, status: 'vacant' },
  ]
};

// Helper function to get all properties as array
export const getAllMockProperties = (): Property[] => {
  return Object.values(mockProperties);
};

// Helper function to get property by ID
export const getMockPropertyById = (id: string): Property | null => {
  return mockProperties[id] || null;
};

// Helper function to get units for a property
export const getMockUnitsForProperty = (propertyId: string): any[] => {
  return mockUnitsData[propertyId] || [];
};
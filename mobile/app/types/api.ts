export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'landlord' | 'tenant' | 'admin';
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: {
      status: string;
      latency: string;
    };
  };
  memory: {
    used: number;
    total: number;
    external: number;
  };
}

export interface Property {
  id: string;
  landlordId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio' | 'duplex';
  description?: string;
  totalUnits: number;
  images?: string[];
  amenities?: string[];
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  // Additional computed fields
  monthlyRent?: number;
  occupiedUnits?: number;
  vacantUnits?: number;
}

// Dummy default export to satisfy Expo Router
export default {};
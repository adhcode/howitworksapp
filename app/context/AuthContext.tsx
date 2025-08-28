import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types/api';
import apiService from '../services/api';

// Simple in-memory storage for now (will be replaced with secure storage later)
class SimpleStorage {
  private storage: { [key: string]: string } = {};

  async getItemAsync(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    this.storage[key] = value;
  }

  async deleteItemAsync(key: string): Promise<void> {
    delete this.storage[key];
  }
}

const storage = new SimpleStorage();

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<{ message: string; email: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItemAsync('auth_token');
      const storedUser = await storage.getItemAsync('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Set token in API service
        apiService.setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const storeAuth = async (authData: AuthResponse) => {
    try {
      await storage.setItemAsync('auth_token', authData.accessToken);
      await storage.setItemAsync('auth_user', JSON.stringify(authData.user));
      setToken(authData.accessToken);
      setUser(authData.user);
      // Set token in API service
      apiService.setAuthToken(authData.accessToken);
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  };

  const clearAuth = async () => {
    try {
      await storage.deleteItemAsync('auth_token');
      await storage.deleteItemAsync('auth_user');
      setToken(null);
      setUser(null);
      // Clear token from API service
      apiService.setAuthToken(null);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const authData = await apiService.login(email, password);
    await storeAuth(authData);

    // Return user data so components can handle navigation
    return authData.user;
  };

  const register = async (userData: any) => {
    const response = await apiService.register(userData);
    // Don't store auth data since user needs to verify email first
    return response;
  };

  const logout = async () => {
    await clearAuth();
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      // TODO: Implement refresh user endpoint
      // const userData = await apiService.getCurrentUser();
      // setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, logout user
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
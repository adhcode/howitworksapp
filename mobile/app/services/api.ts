import { AuthResponse, HealthResponse, Property, User } from '../types/api';

// Configuration
const config = {
  development: {
    baseURL: 'https://howitworksapp-production.up.railway.app', // Using Railway for development too
    timeout: 15000,
    enableLogging: true,
  },
  production: {
    baseURL: 'https://howitworksapp-production.up.railway.app',
    timeout: 15000,
    enableLogging: false,
  },
};

const currentConfig = config[__DEV__ ? 'development' : 'production'];

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Standard API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiService {
  public baseURL: string;
  private authToken: string | null = null;
  private cache = new Map<string, CacheEntry<any>>();
  private config = currentConfig;

  constructor() {
    this.baseURL = this.config.baseURL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  public async getAuthToken(): Promise<string | null> {
    return this.authToken;
  }

  // Cache management
  private getCacheKey(endpoint: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}:${endpoint}:${body}`;
  }

  private isValidCache<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && this.isValidCache(entry)) {
      if (this.config.enableLogging) {
        console.log('🎯 Cache hit:', key);
      }
      return entry.data;
    }
    return null;
  }

  public clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Logging utility
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[API] ${message}`, data || '');
    }
  }

  // Main request method with caching support
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTTL: number = 0
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options);
    const method = options.method || 'GET';

    // Check cache for GET requests only
    if (method === 'GET' && cacheTTL > 0) {
      const cached = this.getCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Make the actual request
    const result = await this.makeRequest<T>(endpoint, options);

    // Cache successful GET requests
    if (method === 'GET' && cacheTTL > 0) {
      this.setCache(cacheKey, result, cacheTTL);
    }

    return result;
  }

  // Core HTTP request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const config: RequestInit = {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    this.log(`${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId); // Clear timeout on successful response

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        this.log(`❌ Request failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      this.log(`✅ Request successful`, data);

      // Standardized response extraction
      return this.extractResponseData<T>(data);
    } catch (error: any) {
      clearTimeout(timeoutId); // Clear timeout on error
      this.log(`💥 Request error: ${error.message}`);

      // Enhanced error handling
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection and make sure the backend is running.');
      }

      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }

      throw error;
    }
  }

  // Standardized response data extraction
  private extractResponseData<T>(data: any): T {
    // Handle different backend response formats consistently
    if (data.success !== undefined) {
      // Format: { success: true, data: {...} }
      return data.data || data;
    }

    if (data.data !== undefined) {
      // Format: { data: {...} } or nested { data: { data: {...} } }
      return data.data.data || data.data;
    }

    // Direct data format
    return data;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    // Clear cache on login
    this.clearCache();
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: 'landlord' | 'tenant';
  }): Promise<{ message: string; email: string }> {
    return this.request<{ message: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/auth/verify-email?token=${token}`);
  }

  async verifyEmailWithCode(email: string, code: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Properties endpoints with caching
  async getProperties(page = 1, limit = 10): Promise<{ data: Property[]; meta: any }> {
    return this.request<{ data: Property[]; meta: any }>(
      `/properties?page=${page}&limit=${limit}`,
      {},
      5 * 60 * 1000 // Cache for 5 minutes
    );
  }

  async createProperty(propertyData: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    propertyType: string;
    totalUnits: number;
    description?: string;
    zipCode?: string;
    images?: string[];
    amenities?: string[];
  }): Promise<Property> {
    // Clear properties cache after creating
    const result = await this.request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
    this.clearCache('properties');
    return result;
  }

  async getProperty(id: string): Promise<Property> {
    return this.request<Property>(
      `/properties/${id}`,
      {},
      10 * 60 * 1000 // Cache for 10 minutes
    );
  }

  async getPropertyWithUnits(id: string): Promise<Property & { units: any[] }> {
    return this.request<Property & { units: any[] }>(
      `/properties/${id}/with-units`,
      {},
      30 * 1000 // 30 seconds cache (shorter than before for better data consistency)
    );
  }

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    const result = await this.request<Property>(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(propertyData),
    });
    // Clear related cache
    this.clearCache(`properties/${id}`);
    this.clearCache('properties');
    return result;
  }

  async deleteProperty(id: string): Promise<{ message: string }> {
    const result = await this.request<{ message: string }>(`/properties/${id}`, {
      method: 'DELETE',
    });
    // Clear related cache
    this.clearCache(`properties/${id}`);
    this.clearCache('properties');
    return result;
  }

  async getPropertyStats(): Promise<{
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
  }> {
    return this.request<{
      totalProperties: number;
      totalUnits: number;
      occupiedUnits: number;
      vacantUnits: number;
    }>(
      '/properties/stats',
      {},
      2 * 60 * 1000 // Cache for 2 minutes
    );
  }

  async getLandlordDashboard(): Promise<{
    propertiesManaged: number;
    fullyOccupied: number;
    activeTenants: number;
    pendingVerification: number;
    rentCollected: number;
    rentCollectedDate: string;
    upcomingPayments: number;
    upcomingPaymentsCombined: number;
    outstandingRent: number;
    outstandingRentTenants: number;
    activeReports: number;
  }> {
    return this.request<{
      propertiesManaged: number;
      fullyOccupied: number;
      activeTenants: number;
      pendingVerification: number;
      rentCollected: number;
      rentCollectedDate: string;
      upcomingPayments: number;
      upcomingPaymentsCombined: number;
      outstandingRent: number;
      outstandingRentTenants: number;
      activeReports: number;
    }>(
      '/landlord/dashboard',
      {},
      1 * 60 * 1000 // Cache for 1 minute
    );
  }

  async refreshLandlordDashboard(): Promise<any> {
    return this.request<any>('/landlord/dashboard/refresh');
  }

  // Payment management methods
  async generatePaymentSchedules(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request<{ success: boolean; data?: any; error?: string }>('/landlord/generate-payment-schedules', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async getLandlordPayments(): Promise<any[]> {
    return this.request<any[]>('/payments/landlord-payments');
  }

  async getLandlordPaymentStats(): Promise<{
    walletBalance: number;
    totalRentCollected: number;
    upcomingPayments: number;
    pendingPayments: number;
    recentTransactions: any[];
  }> {
    // For now, we'll calculate stats from the payments data
    // Later you can create a dedicated endpoint for this
    const payments = await this.getLandlordPayments();
    
    const totalRentCollected = payments
      .filter(p => p.payment?.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.payment?.amountPaid || '0'), 0);
    
    const upcomingPayments = payments
      .filter(p => {
        if (p.payment?.status !== 'pending') return false;
        const dueDate = new Date(p.payment.dueDate);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return dueDate >= today && dueDate <= nextWeek;
      }).length;
    
    const pendingPayments = payments
      .filter(p => p.payment?.status === 'pending' || p.payment?.status === 'overdue')
      .reduce((sum, p) => {
        const amount = parseFloat(p.payment?.amount || '0');
        const paid = parseFloat(p.payment?.amountPaid || '0');
        return sum + (amount - paid);
      }, 0);
    
    const recentTransactions = payments
      .filter(p => p.payment?.status === 'paid')
      .slice(0, 5)
      .map(p => ({
        type: 'credit',
        description: `Rent from ${p.property?.name || 'Property'} - ${p.unit?.unitNumber || 'Unit'}`,
        amount: parseFloat(p.payment?.amountPaid || '0'),
        date: p.payment?.paidDate || p.payment?.createdAt,
      }));
    
    return {
      walletBalance: totalRentCollected * 0.95, // Assume 5% is withdrawn
      totalRentCollected,
      upcomingPayments,
      pendingPayments,
      recentTransactions,
    };
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async processPayment(paymentId: string, amount: number, paymentMethod?: string, notes?: string): Promise<any> {
    return this.request<any>(`/payments/${paymentId}/process`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        paymentMethod,
        notes,
      }),
    });
  }

  // Units endpoints
  async getUnits(propertyId: string) {
    return this.request(`/properties/${propertyId}/units`);
  }

  async createUnit(propertyId: string, unitData: any) {
    return this.request(`/properties/${propertyId}/units`, {
      method: 'POST',
      body: JSON.stringify(unitData),
    });
  }

  async updateUnit(propertyId: string, unitId: string, unitData: any) {
    return this.request(`/properties/${propertyId}/units/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify(unitData),
    });
  }

  async getUnit(propertyId: string, unitId: string) {
    return this.request(`/properties/${propertyId}/units/${unitId}`);
  }

  async deleteUnit(propertyId: string, unitId: string) {
    return this.request(`/properties/${propertyId}/units/${unitId}`, {
      method: 'DELETE',
    });
  }

  // Tenants endpoints
  async getTenants(): Promise<User[]> {
    return this.request<User[]>('/users/tenants');
  }

  async createTenant(tenantData: Partial<User>): Promise<User> {
    return this.request<User>('/users/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async addTenant(tenantData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    unitId: string;
    propertyId: string;
    leaseStartDate: string;
    leaseEndDate: string;
    monthlyRent: number;
    securityDeposit?: number;
    notes?: string;
    landlordPayoutType?: 'monthly' | 'yearly';
    isExistingTenant?: boolean;
    originalExpiryDate?: string;
  }): Promise<{
    invitationToken: string;
    invitationUrl: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }> {
    return this.request('/tenant-invitations', {
      method: 'POST',
      body: JSON.stringify({
        propertyId: tenantData.propertyId,
        unitId: tenantData.unitId,
        firstName: tenantData.firstName,
        lastName: tenantData.lastName,
        email: tenantData.email,
        phone: tenantData.phone,
        emergencyContact: tenantData.emergencyContact,
        emergencyPhone: tenantData.emergencyPhone,
        leaseStartDate: tenantData.leaseStartDate,
        leaseEndDate: tenantData.leaseEndDate,
        monthlyRent: tenantData.monthlyRent,
        securityDeposit: tenantData.securityDeposit,
        notes: tenantData.notes,
        landlordPayoutType: tenantData.landlordPayoutType,
        isExistingTenant: tenantData.isExistingTenant,
        originalExpiryDate: tenantData.originalExpiryDate,
      }),
    });
  }

  // Tenant invitation methods
  async getInvitationByToken(token: string): Promise<any> {
    return this.request<any>(`/tenant-invitations/token/${token}`);
  }

  // Tenant data methods with caching
  async getTenantData(): Promise<{
    property: { name: string; unit: string };
    totalDue: number;
    dueDate: string;
    tenant: { firstName: string; lastName: string };
  }> {
    return this.request<{
      property: { name: string; unit: string };
      totalDue: number;
      dueDate: string;
      tenant: { firstName: string; lastName: string };
    }>(
      '/tenants/my-data',
      {},
      2 * 60 * 1000 // Cache for 2 minutes
    );
  }

  async getTenantPayments(): Promise<{
    totalDue: number;
    dueDate: string;
    paymentHistory: any[];
  }> {
    return this.request<{
      totalDue: number;
      dueDate: string;
      paymentHistory: any[];
    }>(
      '/tenants/payments',
      {},
      1 * 60 * 1000 // Cache for 1 minute
    );
  }

  async getTenantReports(): Promise<any[]> {
    return this.request<any[]>(
      '/tenants/reports',
      {},
      5 * 60 * 1000 // Cache for 5 minutes
    );
  }

  async getTenantComplaints(): Promise<any[]> {
    return this.request<any[]>(
      '/tenants/complaints',
      {},
      2 * 60 * 1000 // Cache for 2 minutes
    );
  }

  async getComplaintDetail(complaintId: string): Promise<any> {
    return this.request<any>(
      `/tenants/complaints/${complaintId}`,
      {},
      10 * 60 * 1000 // Cache for 10 minutes
    );
  }

  async submitComplaint(complaintData: {
    title: string;
    description: string;
    category: string;
    images?: string[];
  }): Promise<any> {
    return this.request<any>('/tenants/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  }

  async validateInvitationToken(token: string): Promise<{ isValid: boolean }> {
    return this.request<{ isValid: boolean }>(`/tenant-invitations/validate/${token}`);
  }

  async registerWithInvitation(invitationData: {
    token: string;
    password: string;
    email: string;
    phone?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
  }) {
    return this.request('/tenant-invitations/register-with-token', {
      method: 'POST',
      body: JSON.stringify({
        token: invitationData.token,
        password: invitationData.password,
        email: invitationData.email,
        phone: invitationData.phone,
        emergencyContact: invitationData.nextOfKinName,
        emergencyPhone: invitationData.nextOfKinPhone,
      }),
    });
  }

  async getMyInvitations() {
    return this.request('/tenant-invitations/my-invitations');
  }

  async getTenantsByLandlord() {
    return this.request('/tenant-invitations/my-tenants');
  }

  async cancelInvitation(invitationId: string) {
    return this.request(`/tenant-invitations/${invitationId}/cancel`, {
      method: 'PATCH',
    });
  }

  async updateTenant(tenantId: string, tenantData: any) {
    return this.request(`/tenants/${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify(tenantData),
    });
  }

  // Leases endpoints
  async getLeases() {
    return this.request('/leases');
  }

  async createLease(leaseData: any) {
    return this.request('/leases', {
      method: 'POST',
      body: JSON.stringify(leaseData),
    });
  }

  // Payments endpoints
  async createPayment(paymentData: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Messages endpoints (updated with comprehensive API)
  async sendMessage(messageData: { receiverId: string; subject?: string; content: string }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getConversation(otherUserId: string, page = 1, limit = 20) {
    return this.request(`/messages/conversation/${otherUserId}?page=${page}&limit=${limit}`);
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  async getUnreadMessageCount() {
    return this.request('/messages/unread-count');
  }

  // Maintenance requests endpoints (updated with comprehensive API)
  async createMaintenanceRequest(requestData: { 
    title: string; 
    description: string; 
    priority?: string;
    images?: string[];
  }) {
    return this.request('/maintenance/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getMaintenanceRequests() {
    return this.request('/maintenance/requests');
  }

  async getMaintenanceRequest(id: string) {
    return this.request(`/maintenance/requests/${id}`);
  }

  async updateMaintenanceRequestStatus(id: string, status: string) {
    return this.request(`/maintenance/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Landlord maintenance endpoints
  async getLandlordMaintenanceRequests(filters?: { status?: string; propertyId?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    const queryString = params.toString();
    return this.request(`/landlord/maintenance${queryString ? `?${queryString}` : ''}`);
  }

  async getLandlordMaintenanceStats() {
    return this.request('/landlord/maintenance/stats');
  }

  async getLandlordMaintenanceRequest(id: string) {
    return this.request(`/landlord/maintenance/${id}`);
  }

  async reportLandlordMaintenance(maintenanceData: {
    propertyId: string;
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    images?: string[];
  }) {
    return this.request('/landlord/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    });
  }

  async addMaintenanceComment(id: string, comment: string) {
    return this.request(`/landlord/maintenance/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  // File upload
  async uploadFile(file: FormData): Promise<{ url: string }> {
    const url = `${this.baseURL}/upload`;
    const token = await this.getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  }



  // Paystack Payment API
  async initializePayment(paymentData: {
    email: string;
    amount: number;
    currency?: string;
    description?: string;
    metadata?: any;
  }) {
    return this.request('/payments/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(reference: string) {
    return this.request('/payments/paystack/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Utility methods
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  public async refreshData(): Promise<void> {
    this.clearCache();
    this.log('🔄 All cache cleared - data will be refreshed on next request');
  }

  public setConfig(newConfig: Partial<typeof currentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.baseURL) {
      this.baseURL = newConfig.baseURL;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
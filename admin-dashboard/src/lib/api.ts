import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
}

// Facilitators API
export const facilitatorsApi = {
  getAll: async () => {
    const response = await api.get('/facilitators')
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/facilitators/${id}`)
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post('/facilitators', data)
    return response.data
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/facilitators/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await api.delete(`/facilitators/${id}`)
    return response.data
  },
  getAssignedProperties: async (id: string) => {
    const response = await api.get(`/facilitators/${id}/properties`)
    return response.data
  },
}

// Properties API
export const propertiesApi = {
  getAll: async (page = 1, limit = 50) => {
    const response = await api.get(`/properties?page=${page}&limit=${limit}`)
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/properties/${id}`)
    return response.data
  },
  assignFacilitator: async (propertyId: string, facilitatorId: string) => {
    const response = await api.patch(`/properties/${propertyId}`, { facilitatorId })
    return response.data
  },
  getUnassigned: async () => {
    const response = await api.get('/properties?facilitatorId=null')
    return response.data
  },
}

// Maintenance API
export const maintenanceApi = {
  getAll: async (filters?: { status?: string; priority?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    const response = await api.get(`/landlord/maintenance?${params.toString()}`)
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/landlord/maintenance/${id}`)
    return response.data
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/landlord/maintenance/${id}`, { status })
    return response.data
  },
}

// Landlords API
export const landlordsApi = {
  getAll: async () => {
    const response = await api.get('/users?role=landlord')
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
}

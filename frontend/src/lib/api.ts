// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type']
  }

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  })

  return response
}

export const apiGet = async (endpoint: string, options: RequestInit = {}) => {
  return apiCall(endpoint, { ...options, method: 'GET' })
}

export const apiPost = async (endpoint: string, data?: any, options: RequestInit = {}) => {
  const body = data instanceof FormData ? data : JSON.stringify(data)
  return apiCall(endpoint, { ...options, method: 'POST', body })
}

export const apiPut = async (endpoint: string, data?: any, options: RequestInit = {}) => {
  const body = data instanceof FormData ? data : JSON.stringify(data)
  return apiCall(endpoint, { ...options, method: 'PUT', body })
}

export const apiPatch = async (endpoint: string, data?: any, options: RequestInit = {}) => {
  const body = data instanceof FormData ? data : JSON.stringify(data)
  return apiCall(endpoint, { ...options, method: 'PATCH', body })
}

export const apiDelete = async (endpoint: string, options: RequestInit = {}) => {
  return apiCall(endpoint, { ...options, method: 'DELETE' })
}

// Dashboard data types
export interface DashboardData {
  companies: Array<{
    id: string
    name: string
    status: 'draft' | 'pending' | 'approved' | 'rejected'
    created_at: string
    updated_at: string
    formation_type: string
    business_activities: Array<{
      id: string
      name: string
      code: string
    }>
  }>
  user: {
    id: string
    email: string
    name?: string
    admin: boolean
    translation_limit: number
    translations_used: number
  }
}

// Dashboard API function
export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await apiGet('/dashboard')
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  
  return response.json()
}
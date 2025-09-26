// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  let defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    const headerObj = { ...defaultHeaders } as Record<string, string>
    delete headerObj['Content-Type']
    defaultHeaders = headerObj
  }

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
    credentials: 'include', // Include cookies for session authentication
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
    trade_name?: string
    free_zone?: string
    status: 'draft' | 'in_progress' | 'pending_payment' | 'processing' | 'approved' | 'issued' | 'rejected'
    license_number?: string
    license_status?: string
    formation_progress?: number
    license_type?: string
    license_expiry_date?: string
    license_renewal_days?: number
    establishment_card_number?: string
    establishment_card_expiry_date?: string
    official_email?: string
    phone?: string
    website?: string
    shareholders?: Array<{
      id: string
      full_name: string
      identification_type: string
      identification_number: string
      passport_number?: string
      passport_expiry_date?: string
      share_percentage: number
      type: string
    }>
    directors?: Array<{
      id: string
      full_name: string
      identification_type: string
      identification_number: string
      passport_number?: string
      passport_expiry_date?: string
      type: string
    }>
    documents?: {
      trade_license?: any
      moa?: any
      certificate_of_incorporation?: any
      commercial_license?: any
    }
    created_at: string
    updated_at: string
  }>
  notifications?: Array<{
    id: string
    type: string
    title: string
    message: string
    urgency: 'low' | 'medium' | 'high' | 'critical'
    created_at: string
    read: boolean
  }>
  stats: {
    total_companies: number
    in_progress: number
    completed: number
    documents_pending: number
  }
}

// Note: Dashboard functionality removed - companies page now fetches data directly
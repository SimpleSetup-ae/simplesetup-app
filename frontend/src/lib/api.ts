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
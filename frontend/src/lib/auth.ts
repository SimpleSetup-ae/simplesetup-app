interface SignInData {
  email: string
  password: string
}

interface SignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
  passwordConfirmation: string
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
}

interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  sessionTimeout?: string
  errors?: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies for session management
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, defaultOptions)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function signIn(email: string, password: string): Promise<User> {
  const data = await apiCall('/api/v1/auth/sign_in', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!data.success) {
    throw new Error(data.message || 'Sign in failed')
  }

  return data.user
}

export async function signUp(userData: SignUpData): Promise<User> {
  const data = await apiCall('/users', {
    method: 'POST',
    body: JSON.stringify({
      user: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.passwordConfirmation,
      },
    }),
  })

  if (!data.success) {
    throw new Error(data.message || data.errors?.join(', ') || 'Sign up failed')
  }

  return data.user
}

export async function signOut(): Promise<void> {
  await apiCall('/api/v1/auth/sign_out', {
    method: 'DELETE',
  })
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await apiCall('/api/v1/auth/me')
    return data.success ? data.user : null
  } catch (error) {
    return null
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user !== null
  } catch (error) {
    return false
  }
}

// OAuth URLs
export const getGoogleAuthUrl = () => `${API_BASE_URL}/users/auth/google_oauth2`
export const getLinkedInAuthUrl = () => `${API_BASE_URL}/users/auth/linkedin`

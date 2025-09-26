'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, signOut as authSignOut } from '@/lib/auth'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.log('Authentication check failed:', error)
      setUser(null)
      // If we're on a protected route and auth failed, redirect to sign-in
      if (typeof window !== 'undefined' && isProtectedRoute(window.location.pathname)) {
        window.location.href = '/sign-in'
      }
    }
  }

  const isProtectedRoute = (pathname: string) => {
    const protectedRoutes = ['/companies', '/documents', '/billing', '/settings', '/users']
    return protectedRoutes.some(route => pathname.startsWith(route))
  }

  const signOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      
      // Clear all browser data to prevent back button bypass
      if (typeof window !== 'undefined') {
        // Clear localStorage and sessionStorage
        localStorage.clear()
        sessionStorage.clear()
        
        // Force a full page reload to clear any cached state
        window.location.replace('/sign-in')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect even if API call fails
      setUser(null)
      
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.replace('/sign-in')
      }
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser()
      setLoading(false)
    }

    initAuth()

    // Check authentication on page visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUser()
      }
    }

    // Check authentication on focus (when user clicks back to window)
    const handleFocus = () => {
      refreshUser()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/sign-in'
    }
  }, [user, loading])

  return { user, loading }
}

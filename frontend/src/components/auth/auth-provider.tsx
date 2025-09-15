'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, signOut as authSignOut } from '@/lib/auth'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
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
      setUser(null)
    }
  }

  const signOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      window.location.href = '/sign-in'
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect even if API call fails
      setUser(null)
      window.location.href = '/sign-in'
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser()
      setLoading(false)
    }

    initAuth()
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

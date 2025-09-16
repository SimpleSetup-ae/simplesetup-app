'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and no user, redirect to sign-in
    if (!loading && !user) {
      const currentPath = window.location.pathname
      const signInUrl = `/sign-in?redirect=${encodeURIComponent(currentPath)}`
      router.replace(signInUrl)
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show fallback or redirect if not authenticated
  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Authentication Required</h2>
          <p className="text-muted-foreground">Redirecting to sign-in...</p>
        </div>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}

// Higher-order component for page-level protection
export function withAuthGuard<T extends object>(
  Component: React.ComponentType<T>
) {
  return function AuthGuardedComponent(props: T) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

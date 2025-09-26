'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

export function PageAuthCheck() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check authentication on every page load
    const checkAuth = async () => {
      if (!loading) {
        await refreshUser()
        
        // If still no user after refresh, redirect
        if (!user) {
          const currentPath = window.location.pathname
          if (isProtectedRoute(currentPath)) {
            router.replace(`/sign-in?redirect=${encodeURIComponent(currentPath)}`)
          }
        }
      }
    }

    checkAuth()

    // Also check on browser back/forward navigation
    const handlePopState = () => {
      checkAuth()
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [user, loading, refreshUser, router])

  return null // This component doesn't render anything
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/companies', '/documents', '/billing', '/settings', '/users', '/visas', '/requests', '/accounting']
  return protectedRoutes.some(route => pathname.startsWith(route))
}

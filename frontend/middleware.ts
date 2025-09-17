import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/companies',
    '/company-formation',
    '/documents',
    '/billing',
    '/settings',
    '/users',
    '/visas',
    '/requests',
    '/accounting'
  ]
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/demo-form',
    '/business-activities'
  ]
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // For protected routes, check authentication with backend
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      // Check authentication with backend API
      const authResponse = await fetch(`http://localhost:3001/api/v1/auth/me`, {
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      })
      
      if (!authResponse.ok) {
        // Not authenticated, redirect to sign-in
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(signInUrl)
      }
      
      // Authenticated, allow access with security headers
      const response = NextResponse.next()
      
      // Add security headers to prevent caching of protected pages
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    } catch (error) {
      // Backend not available or error, redirect to sign-in for security
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/']
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is authenticated by looking for session cookie
  const sessionCookie = request.cookies.get('_simple_setup_session')
  
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/companies',
    '/company-formation',
    '/documents',
    '/billing'
  ]
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/demo-form',
    '/business-activities'
  ]
  
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Redirect to sign-in if accessing protected route without session
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/']
}

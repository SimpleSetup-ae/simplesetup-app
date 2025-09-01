'use client'

import Link from 'next/link'

export default function Navigation() {
  // Temporarily mock authentication state until Clerk is properly configured
  const isSignedIn = false
  const user = null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-black to-gray-400 bg-clip-text text-transparent">
              Simple Setup
            </div>
          </Link>

          {/* Navigation Links */}
          {isSignedIn && (
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/companies" className="text-gray-700 hover:text-gray-900 transition-colors">
                Companies
              </Link>
              <Link href="/documents" className="text-gray-700 hover:text-gray-900 transition-colors">
                Documents
              </Link>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, Demo User
                </span>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  DU
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/sign-in"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-gradient-to-r from-orange-500 to-gray-400 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-gray-500 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

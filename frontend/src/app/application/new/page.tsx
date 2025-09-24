'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * CRITICAL: This page creates new application drafts and redirects to /application/{id}/start
 * 
 * ROUTING ISSUE PREVENTION:
 * - This page should NEVER redirect to '/' (homepage) unless there's a critical error
 * - The API endpoint /api/v1/applications MUST be working for this to function
 * - Always check API response status and structure before redirecting
 * - Add proper error states instead of silent redirects to homepage
 * 
 * DEBUGGING:
 * - If this redirects to '/', check Rails server is running on port 3001
 * - Check browser console for fetch errors
 * - Verify API response structure matches expected format
 */
export default function NewApplicationPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Create a new application draft
    const createDraft = async () => {
      try {
        console.log('🚀 Creating new application draft...')
        
        const response = await fetch('http://localhost:3001/api/v1/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            free_zone: 'IFZA',
            formation_type: 'new_company'
          })
        })
        
        console.log('📡 API Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('📄 API Response data:', data)
        
        if (data.success && data.application_id) {
          // Store the application ID and draft token
          localStorage.setItem('current_application_id', data.application_id)
          if (data.draft_token) {
            localStorage.setItem('draft_token', data.draft_token)
          }
          
          console.log('✅ Application created:', data.application_id)
          
          // Redirect to start page with the new ID
          router.push(`/application/${data.application_id}/start`)
        } else {
          throw new Error(`Invalid API response: ${JSON.stringify(data)}`)
        }
      } catch (err) {
        console.error('❌ Error creating application:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setIsLoading(false)
        
        // DO NOT redirect to homepage on error - show error state instead
      }
    }
    
    createDraft()
  }, [router])
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <strong>Failed to create application</strong>
              <br />
              {error}
              <br />
              <br />
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Creating your application...</p>
        <p className="text-sm text-gray-500 mt-2">
          This should only take a moment
        </p>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function NewApplicationPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Create a new application draft
    const createDraft = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            free_zone: 'IFZA',
            formation_type: 'new_company'
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Store the application ID
          localStorage.setItem('current_application_id', data.application_id)
          
          // Redirect to start page with the new ID
          router.push(`/application/${data.application_id}/start`)
        } else {
          console.error('Failed to create application:', data)
          router.push('/') // Fallback to home
        }
      } catch (err) {
        console.error('Error creating application:', err)
        router.push('/') // Fallback to home
      }
    }
    
    createDraft()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Creating your application...</p>
      </div>
    </div>
  )
}

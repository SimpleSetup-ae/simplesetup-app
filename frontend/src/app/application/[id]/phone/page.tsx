'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
// import { useApplication } from '@/contexts/ApplicationContext' // Not needed
import { PhoneCaptureStep } from '@/components/forms/company-formation/steps/PhoneCaptureStep'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PhonePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tempToken, setTempToken] = useState('')
  const [draftToken, setDraftToken] = useState('')
  
  useEffect(() => {
    // Get temp token from session storage
    const token = sessionStorage.getItem('temp_token')
    if (token) {
      setTempToken(token)
    } else {
      router.push(`/application/${params.id}/signup`)
    }

    const storedDraftToken = localStorage.getItem('draft_token')
    if (storedDraftToken) {
      setDraftToken(storedDraftToken)
    } else {
      setDraftToken(params.id)
    }
  }, [params.id, router])
  
  const handleComplete = async (data: {
    user: any
    token: string
    claimedApplication?: any
    redirectUrl: string
  }) => {
    
    // Store auth token
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      // Clear temp token as we now have full auth
      sessionStorage.removeItem('temp_token')
    }
    
    // If application was claimed, update the ID if needed
    if (data.claimedApplication) {
      // Application was successfully claimed
      console.log('Application claimed:', data.claimedApplication)
    }
    
    // Continue to activities (next step in the flow)
    router.push(`/application/${params.id}/activities`)
  }
  
  const handleSkip = () => {
    // Skip phone and continue
    router.push(`/application/${params.id}/activities`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/verify-email`)
  }
  
  if (!tempToken || !draftToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading phone verification...</p>
          <Button onClick={handleBack} variant="outline">
            Back to Email Verification
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Email Verification
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Application Progress</h2>
            <span className="text-sm text-gray-500">Step 5 of 10</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: '50%' }}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <PhoneCaptureStep
          tempToken={tempToken}
          draftToken={draftToken}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  )
}

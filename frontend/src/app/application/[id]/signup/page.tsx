'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
// import { useApplication } from '@/contexts/ApplicationContext' // Not needed - using localStorage
import { UserSignUpStep } from '@/components/forms/company-formation/steps/UserSignUpStep'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function SignUpPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [draftToken, setDraftToken] = useState<string | null>(null)
  
  // Get draft token from localStorage or cookies
  useEffect(() => {
    // Try to get draft token from application context or localStorage
    const storedToken = localStorage.getItem('draft_token')
    if (storedToken) {
      setDraftToken(storedToken)
    } else {
      // If no draft token, this application ID is the draft token
      setDraftToken(params.id)
    }
  }, [params.id])
  
  const handleComplete = async (userData: {
    user: any
    token: string
    tempToken?: string
    nextStep: 'email_verification' | 'phone_capture' | 'continue'
  }) => {
    // Store user email for verification page
    if (userData.user?.email) {
      sessionStorage.setItem('user_email', userData.user.email)
    }
    
    // Store tokens for next steps
    if (userData.tempToken) {
      sessionStorage.setItem('temp_token', userData.tempToken)
    }
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token)
    }

    if (draftToken) {
      localStorage.setItem('draft_token', draftToken)
    }
    
    // Navigate based on next step
    if (userData.nextStep === 'email_verification') {
      router.push(`/application/${params.id}/verify-email`)
    } else if (userData.nextStep === 'phone_capture') {
      router.push(`/application/${params.id}/phone`)
    } else {
      // User is already verified, continue to activities
      router.push(`/application/${params.id}/activities`)
    }
  }
  
  const handleSkip = () => {
    // Allow continuing as guest (limited features)
    router.push(`/application/${params.id}/activities`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/license`)
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
            Back to License & Visas
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Application Progress</h2>
            <span className="text-sm text-gray-500">Step 3 of 10</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: '30%' }}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <UserSignUpStep
          draftToken={draftToken || params.id}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
        
        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Creating an account allows you to save your progress and return anytime
          </p>
        </div>
      </div>
    </div>
  )
}

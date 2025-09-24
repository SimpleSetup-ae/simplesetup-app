'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
// import { useApplication } from '@/contexts/ApplicationContext' // Not needed
import { EmailVerificationStep } from '@/components/forms/company-formation/steps/EmailVerificationStep'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // const { companyData } = useApplication()
  const [email, setEmail] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [draftToken, setDraftToken] = useState('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = sessionStorage.getItem('temp_token')
    if (token) {
      setTempToken(token)
    }

    const userEmail = sessionStorage.getItem('user_email')
    if (userEmail) {
      setEmail(userEmail)
    }

    const storedDraftToken = localStorage.getItem('draft_token')
    if (storedDraftToken) {
      setDraftToken(storedDraftToken)
    } else {
      setDraftToken(params.id)
    }

    setLoading(false)
  }, [params.id])
  
  const handleVerified = (data: {
    user: any
    tempToken: string
    nextStep: string
  }) => {
    // Update temp token for next step
    sessionStorage.setItem('temp_token', data.tempToken)
    
    // Navigate to phone capture
    router.push(`/application/${params.id}/phone`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/signup`)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading verification...</p>
        </div>
      </div>
    )
  }
  
  if (!tempToken || !email || !draftToken) {
    router.push(`/application/${params.id}/signup`)
    return null
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
            Back to Sign Up
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Application Progress</h2>
            <span className="text-sm text-gray-500">Step 4 of 10</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: '40%' }}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <EmailVerificationStep
          email={email}
          tempToken={tempToken}
          draftToken={draftToken}
          onVerified={handleVerified}
        />
      </div>
    </div>
  )
}

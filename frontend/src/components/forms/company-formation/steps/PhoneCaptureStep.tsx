'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Phone, AlertCircle, ArrowRight } from 'lucide-react'
import { PhoneNumberInput } from '@/components/ui/phone-number-input'
import { cn } from '@/lib/utils'

interface PhoneCaptureStepProps {
  tempToken: string;
  draftToken: string;
  onComplete: (data: {
    user: any;
    token: string;
    claimedApplication?: any;
    redirectUrl: string;
  }) => void;
  onSkip?: () => void;
  className?: string;
}

export function PhoneCaptureStep({
  tempToken,
  draftToken,
  onComplete,
  onSkip,
  className
}: PhoneCaptureStepProps) {
  const [phoneData, setPhoneData] = useState({
    countryCode: '+971',
    phoneNumber: '',
    formatted: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Validate phone number
  const validatePhone = (): boolean => {
    if (!phoneData.phoneNumber) {
      setValidationError('Please enter your phone number')
      return false
    }
    
    // Basic length validation
    if (phoneData.phoneNumber.length < 6) {
      setValidationError('Phone number is too short')
      return false
    }
    
    if (phoneData.phoneNumber.length > 15) {
      setValidationError('Phone number is too long')
      return false
    }
    
    setValidationError(null)
    return true
  }
  
  // Handle phone submission
  const handleSubmit = async () => {
    if (!validatePhone()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/inline_registrations/update_phone', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Temp-Token': tempToken
        },
        credentials: 'include',
        body: JSON.stringify({
          phone_number: phoneData.phoneNumber,
          country_code: phoneData.countryCode,
          temp_token: tempToken,
          draft_token: draftToken
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        onComplete({
          user: data.user,
          token: data.token,
          claimedApplication: data.claimed_application,
          redirectUrl: data.redirect_url
        })
      } else {
        setError(data.error || data.errors?.join(', ') || 'Failed to update phone number')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle skip
  const handleSkip = async () => {
    if (!onSkip) {
      setIsSkipping(true)
      setError(null)
      
      try {
        const response = await fetch('http://localhost:3001/api/v1/inline_registrations/skip_phone', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Temp-Token': tempToken
          },
          credentials: 'include',
        body: JSON.stringify({ temp_token: tempToken, draft_token: draftToken })
        })
        
        const data = await response.json()
        
        if (data.success) {
          onComplete({
            user: data.user,
            token: data.token,
            claimedApplication: data.claimed_application,
            redirectUrl: data.redirect_url
          })
        } else {
          setError(data.error || 'Failed to skip phone number')
        }
      } catch (err) {
        setError('Network error. Please try again.')
      } finally {
        setIsSkipping(false)
      }
    } else {
      onSkip()
    }
  }
  
  return (
    <div className={cn("max-w-xl mx-auto", className)}>
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 flex items-center justify-center">
            <Phone className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Add Your Phone Number
          </CardTitle>
          <CardDescription className="text-base mt-2">
            We'll use this to contact you about your application
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Phone Number Input */}
          <div className="space-y-4">
            <PhoneNumberInput
              value={phoneData}
              onChange={(value) => {
                setPhoneData(value)
                setValidationError(null)
              }}
              error={validationError}
              required
              disabled={isLoading || isSkipping}
            />
            
            {/* Benefits of adding phone */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900">
                Why we need your phone number:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Receive important updates about your application</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Get SMS notifications for document requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Quick support if you need assistance</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || isSkipping || !phoneData.phoneNumber}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <button
              onClick={handleSkip}
              disabled={isLoading || isSkipping}
              className="w-full h-11 text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
            >
              {isSkipping ? (
                <>
                  <Loader2 className="inline mr-2 h-3 w-3 animate-spin" />
                  Skipping...
                </>
              ) : (
                'Skip for now (you can add it later)'
              )}
            </button>
          </div>
          
          {/* Privacy Note */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              🔒 Your phone number is secure and will only be used for application-related communication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


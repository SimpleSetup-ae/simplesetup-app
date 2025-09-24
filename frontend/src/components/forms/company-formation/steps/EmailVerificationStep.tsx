'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailVerificationStepProps {
  email: string;
  tempToken: string;
  draftToken: string;
  onVerified: (data: {
    user: any;
    tempToken: string;
    nextStep: string;
  }) => void;
  onResend?: () => void;
  className?: string;
}

export function EmailVerificationStep({
  email,
  tempToken,
  draftToken,
  onVerified,
  onResend,
  className
}: EmailVerificationStepProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Start countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])
  
  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '') // Only digits
    
    if (pastedData.length >= 6) {
      const digits = pastedData.slice(0, 6).split('')
      setOtpCode(digits)
      
      // Focus the last input or verify button
      if (digits.length === 6) {
        inputRefs.current[5]?.blur() // Remove focus to show complete state
      } else {
        inputRefs.current[digits.length - 1]?.focus()
      }
      
      // Clear any errors
      if (error) setError(null)
    }
  }

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '') // Only digits
    
    if (cleanValue.length > 1) {
      // Handle paste or multiple characters
      const digits = cleanValue.slice(0, 6).split('')
      const newOtp = ['', '', '', '', '', '']
      
      // Fill from the current index
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit
        }
      })
      
      setOtpCode(newOtp)
      
      // Focus the last filled input or next empty
      const lastFilledIndex = newOtp.findLastIndex(d => d !== '')
      if (lastFilledIndex < 5 && lastFilledIndex >= 0) {
        inputRefs.current[lastFilledIndex + 1]?.focus()
      } else if (lastFilledIndex === 5) {
        inputRefs.current[5]?.blur() // Complete, remove focus
      }
    } else {
      // Single digit input
      const newOtp = [...otpCode]
      newOtp[index] = cleanValue
      setOtpCode(newOtp)
      
      // Auto-focus next input
      if (cleanValue && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
    
    // Clear error when typing
    if (error) setError(null)
  }
  
  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      handleVerify()
    }
  }
  
  // Handle verification
  const handleVerify = async () => {
    const code = otpCode.join('')
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/inline_registrations/verify_email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Temp-Token': tempToken
        },
        credentials: 'include',
        body: JSON.stringify({ 
          otp_code: code,
          temp_token: tempToken,
          draft_token: draftToken
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        onVerified({
          user: data.user,
          tempToken: data.temp_token,
          nextStep: data.next_step
        })
      } else {
        setError(data.error || 'Invalid verification code')
        // Clear the OTP inputs on error
        setOtpCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle resend
  const handleResend = async () => {
    if (!canResend) return
    
    setCanResend(false)
    setResendTimer(60)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/inline_registrations/resend_otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Temp-Token': tempToken
        },
        credentials: 'include',
        body: JSON.stringify({ temp_token: tempToken, draft_token: draftToken })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setError(data.error || 'Failed to resend code')
        setCanResend(true)
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.')
      setCanResend(true)
    }
  }
  
  return (
    <div className={cn("max-w-xl mx-auto", className)}>
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 flex items-center justify-center">
            <Mail className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-base mt-2">
            We've sent a verification code to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {otpCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={6} // Allow paste of full code
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className={cn(
                    "w-12 h-12 text-center text-lg font-semibold",
                    "focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                    error && "border-red-500"
                  )}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <p className="text-sm text-center text-gray-600">
              Enter the 6-digit code sent to your email
            </p>
            <p className="text-xs text-center text-gray-500">
              💡 You can paste the entire code into any box
            </p>
          </div>
          
          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isLoading || otpCode.some(d => !d)}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
          
          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Resend Code
                </button>
              ) : (
                <span className="text-gray-500">
                  Resend in {resendTimer}s
                </span>
              )}
            </p>
          </div>
          
          {/* Tips */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              💡 Check your spam folder if you don't see the email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

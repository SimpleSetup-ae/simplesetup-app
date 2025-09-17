'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Shield, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'

interface AuthenticationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
  draftToken?: string
}

type AuthStep = 'email' | 'password' | 'otp' | 'success'

export function AuthenticationModal({ isOpen, onClose, onSuccess, draftToken }: AuthenticationModalProps) {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null)
  
  // Reset timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])
  
  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Validate password strength
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }
  
  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if user exists
      const checkResponse = await fetch('http://localhost:3001/api/v1/auth/check_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const checkData = await checkResponse.json()
      
      if (checkData.exists) {
        // Existing user - send OTP directly
        setIsExistingUser(true)
        await sendOtp()
        setStep('otp')
      } else {
        // New user - go to password setup
        setIsExistingUser(false)
        setStep('password')
      }
    } catch (error) {
      console.error('Email check error:', error)
      // If check fails, assume new user and continue to password
      setIsExistingUser(false)
      setStep('password')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle password setup
  const handlePasswordSubmit = async () => {
    const passwordValidation = validatePassword(password)
    if (passwordValidation) {
      setPasswordError(passwordValidation)
      return
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setPasswordError(null)
    
    try {
      // Register user with password
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          draft_token: draftToken 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Send OTP after successful registration
        await sendOtp()
        setStep('otp')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Send OTP
  const sendOtp = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/send_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResendTimer(60) // 60 second cooldown
        // In development, show the OTP code
        if (data.otp_code) {
          setDevOtpCode(data.otp_code)
        }
      } else {
        setError(data.message || 'Failed to send verification code')
      }
    } catch (error) {
      console.error('OTP send error:', error)
      setError('Failed to send verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Verify OTP
  const handleOtpSubmit = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otp_code: otpCode,
          password: !isExistingUser ? password : undefined,
          draft_token: draftToken
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Store auth token
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_email', email)
        
        // Show success state
        setStep('success')
        
        // Call success callback after short delay
        setTimeout(() => {
          onSuccess(data.user)
        }, 1500)
      } else {
        setError(data.message || 'Invalid verification code')
      }
    } catch (error) {
      console.error('OTP verify error:', error)
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    await sendOtp()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        {/* Email Step */}
        {step === 'email' && (
          <>
            <CardHeader>
              <CardTitle>Continue Your Application</CardTitle>
              <CardDescription>
                Enter your email to save your progress and continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleEmailSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )}
        
        {/* Password Setup Step */}
        {step === 'password' && (
          <>
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                Set a password for your account at {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError(null)
                    }}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setPasswordError(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Password requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                </ul>
              </div>
              
              {(error || passwordError) && (
                <Alert variant="destructive">
                  <AlertDescription>{error || passwordError}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handlePasswordSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )}
        
        {/* OTP Verification Step */}
        {step === 'otp' && (
          <>
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We sent a 6-digit code to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      setOtpCode(value)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleOtpSubmit()}
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Show OTP code in development */}
              {devOtpCode && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-center">
                    <strong>Development Mode - OTP Code: {devOtpCode}</strong>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                >
                  {resendTimer > 0 
                    ? `Resend code in ${resendTimer}s` 
                    : 'Resend verification code'
                  }
                </button>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(isExistingUser ? 'email' : 'password')}
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleOtpSubmit} disabled={isLoading || otpCode.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Continue
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )}
        
        {/* Success Step */}
        {step === 'success' && (
          <>
            <CardHeader>
              <CardTitle>Success!</CardTitle>
              <CardDescription>
                Your account has been created and verified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-center text-gray-600">
                Redirecting to your application...
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}

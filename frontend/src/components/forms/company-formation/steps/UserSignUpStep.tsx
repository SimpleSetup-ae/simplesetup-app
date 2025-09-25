'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserSignUpStepProps {
  draftToken?: string;
  onComplete: (userData: {
    user: any;
    token: string;
    tempToken?: string;
    nextStep: 'email_verification' | 'phone_capture' | 'continue';
  }) => void;
  onSkip?: () => void;
  className?: string;
}

export function UserSignUpStep({
  draftToken,
  onComplete,
  onSkip,
  className
}: UserSignUpStepProps) {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // Sign up fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  })
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    })
  }, [password])
  
  // Validate form before submission
  const validateSignUpForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (!Object.values(passwordStrength).every(Boolean)) {
      errors.password = 'Password does not meet requirements'
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Handle sign up
  const handleSignUp = async () => {
    if (!validateSignUpForm()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/inline_registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          password_confirmation: confirmPassword,
          first_name: firstName,
          last_name: lastName,
          draft_token: draftToken
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        onComplete({
          user: data.user,
          token: data.token,
          tempToken: data.temp_token,
          nextStep: data.next_step || 'email_verification'
        })
      } else {
        if (data.existing_user) {
          setActiveTab('signin')
          setError('An account with this email already exists. Please sign in.')
        } else {
          setError(data.error || data.errors?.join(', ') || 'Sign up failed')
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle sign in
  const handleSignIn = async () => {
    if (!email || !password) {
      setFieldErrors({
        ...(!email && { email: 'Email is required' }),
        ...(!password && { password: 'Password is required' })
      })
      return
    }
    
    setIsLoading(true)
    setError(null)
    setFieldErrors({})
    
    try {
      // First authenticate
      const response = await fetch('http://localhost:3001/api/v1/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          draft_token: draftToken
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // If OTP is required
        if (data.requires_otp) {
          onComplete({
            user: { email },
            token: '',
            tempToken: data.temp_token,
            nextStep: 'email_verification'
          })
        } else {
          // Direct login success
          onComplete({
            user: data.user,
            token: data.token,
            nextStep: 'continue'
          })
        }
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-base mt-2">
            To continue with your application, please create an account or sign in
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signup' | 'signin')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-400 data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-400 data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupEmail">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFieldErrors(prev => ({ ...prev, email: '' }))
                    }}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 h-10",
                      fieldErrors.email && "border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupPassword">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFieldErrors(prev => ({ ...prev, password: '' }))
                    }}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 h-10",
                      fieldErrors.password && "border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-600">{fieldErrors.password}</p>
                )}
                
                {/* Password strength indicator */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700">Password Requirements:</p>
                  <div className="space-y-1">
                    <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters" />
                    <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 h-10",
                      fieldErrors.confirmPassword && "border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => {
                      setAgreeToTerms(checked as boolean)
                      setFieldErrors(prev => ({ ...prev, terms: '' }))
                    }}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-orange-600 hover:text-orange-700 underline">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-orange-600 hover:text-orange-700 underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {fieldErrors.terms && (
                  <p className="text-sm text-red-600">{fieldErrors.terms}</p>
                )}
              </div>
              
              <Button
                onClick={handleSignUp}
                disabled={isLoading || !agreeToTerms}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="signin" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="signinEmail">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signinEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFieldErrors(prev => ({ ...prev, email: '' }))
                    }}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 h-10",
                      fieldErrors.email && "border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signinPassword">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signinPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFieldErrors(prev => ({ ...prev, password: '' }))
                    }}
                    disabled={isLoading}
                    className={cn(
                      "pl-10 h-10",
                      fieldErrors.password && "border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" disabled={isLoading} />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <a href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
                  Forgot password?
                </a>
              </div>
              
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign up
                </button>
              </div>
            </TabsContent>
          </Tabs>
          
          {onSkip && (
            <div className="mt-6 pt-6 border-t text-center">
              <button
                onClick={onSkip}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Continue as guest (limited features)
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Password requirement indicator component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center space-x-2">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
      )}
      <span className={cn(
        "text-xs",
        met ? "text-green-700" : "text-gray-600"
      )}>
        {text}
      </span>
    </div>
  )
}



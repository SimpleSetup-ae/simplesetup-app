'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Background } from '@/components/ui/background-dots-masked'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { FREE_ZONES } from '@simple-setup/shared'

export default function CompanyFormationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedReason, setSelectedReason] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [numberOfShareholders, setNumberOfShareholders] = useState(1)
  const [companyName, setCompanyName] = useState("")
  const [nameValidation, setNameValidation] = useState<{errors: string[], isValid: boolean}>({errors: [], isValid: true})
  
  const [formData, setFormData] = useState({
    name: '',
    trade_name: '',
    free_zone: 'IFZA',
    business_activity: '',
    business_description: '',
    shareholders: [{ full_name: '', nationality: '', passport_number: '', share_percentage: 100 }],
    directors: [{ full_name: '', nationality: '', passport_number: '' }]
  })

  const reasons = [
    { id: "new-company", label: "New company creation" },
    { id: "visa-purposes", label: "Setup for visa purposes only" },
    { id: "international-expansion", label: "International Expansion (of an existing business)" }
  ]

  const businessSuggestions = [
    "Software Development",
    "Consultancy",
    "Public Relations",
    "Marketing Agency",
    "Trading Company",
    "Real Estate",
    "E-commerce",
    "Financial Services",
    "Healthcare Services",
    "Educational Services"
  ]

  const filteredSuggestions = businessSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(businessType.toLowerCase())
  ).slice(0, 3)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayFieldChange = (arrayField: string, index: number, field: string, value: any) => {
    setFormData(prev => {
      const currentArray = prev[arrayField as keyof typeof prev] as any[]
      return {
        ...prev,
        [arrayField]: currentArray.map((item: any, i: number) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    })
  }

  const addArrayItem = (arrayField: string, template: any) => {
    setFormData(prev => {
      const currentArray = prev[arrayField as keyof typeof prev] as any[]
      return {
        ...prev,
        [arrayField]: [...currentArray, template]
      }
    })
  }

  const removeArrayItem = (arrayField: string, index: number) => {
    setFormData(prev => {
      const currentArray = prev[arrayField as keyof typeof prev] as any[]
      return {
        ...prev,
        [arrayField]: currentArray.filter((_: any, i: number) => i !== index)
      }
    })
  }

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason)
    // Auto-advance to next step
    setTimeout(() => {
      setCurrentStep(2)
    }, 300)
  }

  const handleBusinessTypeChange = (value: string) => {
    setBusinessType(value)
    setShowSuggestions(value.length > 0)
    setSelectedSuggestionIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      )
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault()
      selectSuggestion(filteredSuggestions[selectedSuggestionIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setBusinessType(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    
    // Focus on the Next Step button after selection
    setTimeout(() => {
      const nextButton = document.querySelector('[data-next-button="true"]') as HTMLButtonElement
      if (nextButton) {
        nextButton.focus()
      }
    }, 100)
  }

  const validateCompanyName = (name: string) => {
    if (name.length < 3) {
      setNameValidation({ errors: [], isValid: true })
      return
    }

    const errors: string[] = []

    // Check for invalid characters (only letters, numbers, spaces, and & allowed)
    const invalidChars = /[^a-zA-Z0-9\s&]/
    if (invalidChars.test(name)) {
      errors.push("Only letters, numbers, spaces, and ampersand (&) are allowed")
    }

    // Check for double spaces or spaces at beginning/end
    if (name.includes('  ') || name.startsWith(' ') || name.endsWith(' ')) {
      errors.push("No double spaces or spaces at the beginning/end")
    }

    // Check that no single word is less than 3 characters
    const words = name.trim().split(/\s+/)
    const shortWords = words.filter(word => word.length < 3 && word.length > 0)
    if (shortWords.length > 0) {
      errors.push("Each word must be at least 3 characters long")
    }

    // Check for consecutive spaces between letters (not allowed)
    if (/[a-zA-Z]\s{2,}[a-zA-Z]/.test(name)) {
      errors.push("Multiple spaces between words are not allowed")
    }

    setNameValidation({ errors, isValid: errors.length === 0 })
  }

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value)
    validateCompanyName(value)
  }

  const handleNext = () => {
    if (currentStep === 2 && businessType) {
      setCurrentStep(3)
    } else if (currentStep === 3 && numberOfShareholders) {
      setCurrentStep(4)
    } else if (currentStep === 4) {
      setCurrentStep(5)
    } else if (currentStep === 5 && companyName && nameValidation.isValid) {
      // TODO: Submit form
      console.log("Form completed:", { 
        selectedReason, 
        businessType, 
        numberOfShareholders, 
        companyName,
        formData 
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    // Only allow navigation to current step or previous completed steps
    if (step <= currentStep) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // This would submit to the backend API
    console.log('Submitting company formation:', formData)
    
    // Mock API call
    alert('Company formation submitted! (This would integrate with the backend API)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dotted Background */}
      <Background />
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Link href="/" className="hover:scale-105 transition-all duration-300">
              <div className="border-2 border-foreground px-3 py-1 rounded-md">
                <Logo />
              </div>
            </Link>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                onClick={() => handleStepClick(step)}
                className={`w-6 h-2 rounded-full transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-primary cursor-pointer hover:bg-primary/80' 
                    : 'bg-muted cursor-not-allowed'
                } ${step <= currentStep ? 'hover:scale-110' : ''}`}
                title={step <= currentStep ? `Go to step ${step}` : `Step ${step} - not available yet`}
              ></div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 md:p-12 shadow-xl">
          {currentStep === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                  Reason for company formation?
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">
                  Help us understand your business needs
                </p>
              </div>

              <div className="space-y-4">
                <RadioGroup value={selectedReason} onValueChange={handleReasonSelect} className="space-y-4">
                  {reasons.map((reason) => (
                    <div
                      key={reason.id}
                      className={`flex items-center space-x-4 p-4 md:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 ${
                        selectedReason === reason.id
                          ? "border-accent bg-gradient-to-r from-accent/5 to-background/80"
                          : "border-border bg-background/50"
                      }`}
                      onClick={() => handleReasonSelect(reason.id)}
                    >
                      <RadioGroupItem value={reason.id} id={reason.id} />
                      <Label
                        htmlFor={reason.id}
                        className="flex-1 text-base md:text-lg font-medium cursor-pointer"
                      >
                        {reason.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                  Business Type?
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">
                  What type of business will you be running?
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <Input
                    key="business-type-input"
                    placeholder="Type your business type..."
                    value={businessType}
                    onChange={(e) => handleBusinessTypeChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(businessType.length > 0)}
                    className="w-full h-12 md:h-14 text-base md:text-lg rounded-xl border-2 focus:border-primary"
                  />
                  
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border rounded-xl shadow-lg animate-fade-in">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-3 cursor-pointer transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                            index === selectedSuggestionIndex 
                              ? 'bg-gradient-to-r from-accent/15 to-background/80 text-accent' 
                              : 'hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80'
                          }`}
                          onClick={() => selectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-12 md:h-14 px-6 text-base md:text-lg font-semibold rounded-xl border-2 hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 transition-all duration-300"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!businessType}
                    data-next-button="true"
                    className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                  Number of Shareholders?
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">
                  How many shareholders will your company have?
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 md:p-6 border rounded-lg bg-muted/30 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNumberOfShareholders(Math.max(1, numberOfShareholders - 1))}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-center min-w-[80px]">
                    <div className="text-xl md:text-2xl font-bold">{numberOfShareholders}</div>
                    <div className="text-xs text-muted-foreground">shareholder{numberOfShareholders !== 1 ? 's' : ''}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setNumberOfShareholders(Math.min(10, numberOfShareholders + 1))}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-12 md:h-14 px-6 text-base md:text-lg font-semibold rounded-xl border-2 hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 transition-all duration-300"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                  Authentication Required
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">
                  Please sign in to continue with your company formation
                </p>
              </div>

              <div className="space-y-6">
                <div className="text-center p-6 border rounded-xl bg-gradient-to-r from-accent/5 to-background/80">
                  <p className="text-lg font-medium mb-2">Authentication will be integrated here</p>
                  <p className="text-muted-foreground">Secure authentication with Devise</p>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-12 md:h-14 px-6 text-base md:text-lg font-semibold rounded-xl border-2 hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 transition-all duration-300"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {currentStep === 5 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                  Company Name?
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">
                  Enter your proposed company name
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      key="company-name-input"
                      placeholder="Your company name"
                      value={companyName}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      className={`flex-1 h-12 md:h-14 text-base md:text-lg rounded-xl border-2 focus:border-primary ${
                        companyName.length >= 3 && !nameValidation.isValid ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    <div className="px-4 py-3 bg-muted rounded-xl border-2 border-border">
                      <span className="text-base md:text-lg font-medium text-muted-foreground">FZCO</span>
                    </div>
                  </div>
                  
                  {/* Validation Errors */}
                  {companyName.length >= 3 && nameValidation.errors.length > 0 && (
                    <div className="space-y-2">
                      {nameValidation.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-500 flex items-center">
                          <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {companyName.length >= 3 && nameValidation.isValid && (
                    <p className="text-sm text-green-600 flex items-center">
                      <span className="w-1 h-1 bg-green-600 rounded-full mr-2"></span>
                      Company name is valid
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  You'll be creating an FZCO company in the IFZA Free Zone
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-12 md:h-14 px-4 sm:px-6 text-sm sm:text-base md:text-lg font-semibold rounded-xl border-2 hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 transition-all duration-300 order-2 sm:order-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!companyName || !nameValidation.isValid}
                    className="flex-1 h-12 md:h-14 text-sm sm:text-base md:text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of 5
            </p>
            <p className="text-sm text-muted-foreground">
              No markups, transparent pricing
            </p>
          </div>
          
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

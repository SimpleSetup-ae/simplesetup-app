'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { PricingBanner } from '@/components/application/PricingBanner'
import { ArrowLeft, ArrowRight, Info, AlertCircle, CheckCircle, Globe, Loader2 } from 'lucide-react'

interface NameValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export default function CompanyNamesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress } = useApplication()
  
  const [nameOptions, setNameOptions] = useState<string[]>(
    applicationData.name_options || ['', '', '']
  )
  const [arabicNames, setArabicNames] = useState<(string | null)[]>([null, null, null])
  const [translating, setTranslating] = useState<boolean[]>([false, false, false])
  const [validations, setValidations] = useState<(NameValidation | null)[]>([null, null, null])
  const [translationLimit, setTranslationLimit] = useState<number>(100)
  const [translationsUsed, setTranslationsUsed] = useState<number>(0)
  const [errors, setErrors] = useState<string[]>([])
  
  useEffect(() => {
    updateProgress(3, 'names')
    fetchTranslationLimit()
  }, [])

  // Validate existing names when nameOptions changes (on mount or when loaded from application data)
  useEffect(() => {
    const initialValidations: (NameValidation | null)[] = [null, null, null]
    nameOptions.forEach((name, index) => {
      if (name && name.trim()) {
        initialValidations[index] = validateName(name)
      }
    })
    setValidations(initialValidations)
  }, [nameOptions.join(',')]) // Re-run when nameOptions content changes
  
  const fetchTranslationLimit = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${API_BASE_URL}/translations/limit`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setTranslationLimit(data.limit)
        setTranslationsUsed(data.used)
      }
    } catch (err) {
      console.error('Failed to fetch translation limit:', err)
    }
  }
  
  const validateName = (name: string): NameValidation => {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!name) {
      return { isValid: true, errors: [], warnings: [] }
    }
    
    // Forbidden words
    const forbiddenWords = ['Dubai', 'Emirates', 'UAE', 'Arab', 'Islamic', 'Royal', 'National']
    const rudeWords = ['damn', 'hell'] // Add more as needed
    
    // Check length
    if (name.length < 3) {
      errors.push('Name must be at least 3 characters long')
    }
    
    if (name.length > 100) {
      errors.push('Name must be less than 100 characters')
    }
    
    // Check for forbidden words
    forbiddenWords.forEach(word => {
      if (name.toLowerCase().includes(word.toLowerCase())) {
        errors.push(`Cannot use "${word}" in company name without special approval`)
      }
    })
    
    // Check for rude words
    rudeWords.forEach(word => {
      if (name.toLowerCase().includes(word.toLowerCase())) {
        errors.push(`Inappropriate word detected: "${word}"`)
      }
    })
    
    // Check if single word
    if (name.trim().split(' ').length === 1 && name.length < 5) {
      warnings.push('Single word names should be at least 5 characters')
    }
    
    // Check for special characters
    if (!/^[a-zA-Z0-9\s\-&.,]+$/.test(name)) {
      warnings.push('Special characters may require additional approval')
    }
    
    // Check if ends with common suffixes
    const commonSuffixes = ['LLC', 'Ltd', 'Limited', 'Inc', 'Corp', 'Company']
    const hasCommonSuffix = commonSuffixes.some(suffix => 
      name.trim().toLowerCase().endsWith(suffix.toLowerCase())
    )
    
    if (hasCommonSuffix) {
      warnings.push('Legal suffix will be added automatically (e.g., "FZE", "FZ-LLC")')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  const handleNameChange = (index: number, value: string) => {
    const updated = [...nameOptions]
    updated[index] = value
    setNameOptions(updated)
    
    // Validate the name
    const validation = validateName(value)
    const updatedValidations = [...validations]
    updatedValidations[index] = validation
    setValidations(updatedValidations)
    
    // Clear Arabic translation if name changed
    const updatedArabic = [...arabicNames]
    updatedArabic[index] = null
    setArabicNames(updatedArabic)
  }
  
  const translateToArabic = async (index: number) => {
    const name = nameOptions[index]
    if (!name || !name.trim()) {
      setErrors(['Please enter a company name before translating'])
      return
    }
    
    // Check validation
    const validation = validateName(name)
    if (!validation.isValid) {
      setErrors(['Please fix validation errors before translating'])
      return
    }
    
    // Check translation limit
    if (translationsUsed >= translationLimit) {
      setErrors(['Monthly translation limit reached (100 requests)'])
      return
    }
    
    const updatedTranslating = [...translating]
    updatedTranslating[index] = true
    setTranslating(updatedTranslating)
    setErrors([])
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${API_BASE_URL}/translations/arabic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: name })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const updatedArabic = [...arabicNames]
        updatedArabic[index] = data.translated
        setArabicNames(updatedArabic)
        
        setTranslationsUsed(prev => prev + 1)
      } else {
        setErrors([data.message || 'Translation failed'])
      }
    } catch (err) {
      setErrors(['Translation service temporarily unavailable'])
      console.error('Translation error:', err)
    } finally {
      const updatedTranslating = [...translating]
      updatedTranslating[index] = false
      setTranslating(updatedTranslating)
    }
  }
  
  const validateAndContinue = async () => {
    const validationErrors: string[] = []
    
    // Check at least one valid name
    const validNames = nameOptions.filter((name, index) => {
      if (!name || !name.trim()) return false
      const validation = validations[index]
      return validation && validation.isValid
    })
    
    if (validNames.length === 0) {
      validationErrors.push('Please provide at least one valid company name')
    }
    
    // Check if any names have errors
    validations.forEach((validation, index) => {
      if (validation && nameOptions[index] && validation.errors.length > 0) {
        validationErrors.push(`Name option ${index + 1} has validation errors`)
      }
    })
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    // Save data
    await updateApplication({
      name_options: nameOptions.filter(n => n && n.trim()),
      name_arabic: arabicNames.find(n => n) || undefined // Save first Arabic translation if available
    }, 'names')
    
    router.push(`/application/${params.id}/shareholding`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/activities`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Name Options</CardTitle>
                <CardDescription>
                  Please provide 3 company name options in order of preference. 
                  If your first choice isn't available, we'll use your second option, then your third option.
                  We'll register the first approved name from your list.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
{/* Translation Limit Info - Hidden but functionality preserved */}
                
                {/* Name Options */}
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`name-${index}`}>
                        Name Option {index + 1}
                        {index === 0 && <Badge className="ml-2">1st Choice</Badge>}
                        {index === 1 && <Badge variant="secondary" className="ml-2">2nd Choice</Badge>}
                        {index === 2 && <Badge variant="outline" className="ml-2">3rd Choice</Badge>}
                      </Label>
                      {validations[index] && nameOptions[index] && (
                        <div>
                          {validations[index]!.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Input
                      id={`name-${index}`}
                      placeholder="Enter company name..."
                      value={nameOptions[index] || ''}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className={validations[index] && !validations[index]!.isValid ? 'border-red-500' : ''}
                    />
                    
                    {/* Validation Messages */}
                    {validations[index] && nameOptions[index] && (
                      <div className="space-y-1">
                        {validations[index]!.errors.map((error, i) => (
                          <div key={i} className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {error}
                          </div>
                        ))}
                        {validations[index]!.warnings.map((warning, i) => (
                          <div key={i} className="text-sm text-yellow-600 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Arabic Translation */}
                    {nameOptions[index] && validations[index]?.isValid && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Arabic Translation</Label>
                          {!arabicNames[index] && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => translateToArabic(index)}
                              disabled={translating[index] || translationsUsed >= translationLimit}
                            >
                              {translating[index] ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Translating...
                                </>
                              ) : (
                                <>
                                  <Globe className="h-4 w-4 mr-2" />
                                  Translate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {arabicNames[index] && (
                          <div className="p-3 bg-gray-50 rounded-md text-right" dir="rtl">
                            <span className="text-lg">{arabicNames[index]}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Name Policy Info */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Naming Guidelines:</strong>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                      <li>Names must be unique and not already registered</li>
                      <li>Cannot use protected words without approval (Dubai, Emirates, UAE, etc.)</li>
                      <li>Must be appropriate and professional</li>
                      <li>Legal suffix (FZE, FZ-LLC) will be added automatically</li>
                      <li>Arabic translation is required for final registration</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                {/* Errors */}
                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc pl-4">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={validateAndContinue}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Pricing Banner */}
          <div className="lg:col-span-1">
            <PricingBanner />
          </div>
        </div>
      </div>
    </div>
  )
}

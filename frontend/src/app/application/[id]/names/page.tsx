'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { StandardFormLayout } from '@/components/application/StandardFormLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Info, AlertCircle, CheckCircle, Globe, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface NameValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export default function CompanyNamesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress } = useApplication()
  
  const formDataArabicName = applicationData.form_data?.name_arabic as string | undefined
  const formDataNameOptions = applicationData.form_data?.name_options as string[] | undefined
  const [nameOptions, setNameOptions] = useState<string[]>(() => {
    const initial = formDataNameOptions || applicationData.name_options || []
    return [...initial, '', '', ''].slice(0, 3)
  })
  const [arabicNames, setArabicNames] = useState<(string | null)[]>([null, null, null])
  const [translating, setTranslating] = useState<boolean[]>([false, false, false])
  const [validations, setValidations] = useState<(NameValidation | null)[]>([null, null, null])
  const [translationLimit, setTranslationLimit] = useState<number>(100)
  const [translationsUsed, setTranslationsUsed] = useState<number>(0)
  const [errors, setErrors] = useState<string[]>([])
  const nameOptionsKey = JSON.stringify({
    persisted: applicationData.name_options,
    form: formDataNameOptions
  })
  
  useEffect(() => {
    updateProgress(3, 'names')
    fetchTranslationLimit()
  }, [])

  useEffect(() => {
    const sourceOptions = formDataNameOptions || applicationData.name_options
    if (sourceOptions && sourceOptions.length > 0) {
      const padded = [...sourceOptions]
      while (padded.length < 3) {
        padded.push('')
      }
      const normalized = padded.slice(0, 3)
      const normalizedKey = JSON.stringify(normalized)
      if (normalizedKey !== nameOptionsKey) {
        setNameOptions(normalized)
      }
    }
  }, [nameOptionsKey])

  useEffect(() => {
    const existingArabic = applicationData.name_arabic || formDataArabicName
    if (existingArabic) {
      setArabicNames(prev => {
        if (prev[0] === existingArabic) return prev
        const updated = [...prev]
        updated[0] = existingArabic
        return updated
      })
    }
  }, [applicationData.name_arabic, formDataArabicName])

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
        
        if (typeof data.remaining_requests === 'number') {
          setTranslationsUsed(Math.max(0, translationLimit - data.remaining_requests))
        } else {
          setTranslationsUsed(prev => prev + 1)
        }

        await updateApplication({
          name_options: nameOptions.filter(n => n && n.trim()),
          name_arabic: data.translated
        }, 'names')
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
    <StandardFormLayout
      title="Company Name Options"
      subtitle="Provide 3 company name options in order of preference. We'll register the first approved name."
      onBack={handleBack}
      onContinue={validateAndContinue}
      errors={errors}
      maxWidth="7xl"
      showPricing
    >
      <Card>
        <CardContent className="space-y-6 pt-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg bg-white">
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
                      <CheckCircle className="h-5 w-5 text-success-500" />
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

              {nameOptions[index] && validations[index]?.isValid && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm">Arabic Translation</Label>
                    {arabicNames[index] ? (
                      <div className="flex-1 text-right" dir="rtl">
                        <span className="text-lg">{arabicNames[index]}</span>
                      </div>
                    ) : (
                      <div className="flex-1 text-right">
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
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <Alert>
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
        </CardContent>
      </Card>
    </StandardFormLayout>
  )
}

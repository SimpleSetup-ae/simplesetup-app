'use client'

import { useState, useCallback } from 'react'

export interface ValidationRule {
  field: string
  message: string
  validate: (value: any, allData?: any) => boolean
}

export function useFormValidation() {
  const [errors, setErrors] = useState<string[]>([])

  const validateField = useCallback((value: any, rules: ValidationRule[], allData?: any): boolean => {
    const fieldErrors: string[] = []
    
    rules.forEach(rule => {
      if (!rule.validate(value, allData)) {
        fieldErrors.push(rule.message)
      }
    })
    
    return fieldErrors.length === 0
  }, [])

  const validateForm = useCallback((data: any, rules: ValidationRule[]): boolean => {
    const allErrors: string[] = []
    
    rules.forEach(rule => {
      const fieldValue = data[rule.field]
      if (!rule.validate(fieldValue, data)) {
        allErrors.push(rule.message)
      }
    })
    
    setErrors(allErrors)
    return allErrors.length === 0
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const addError = useCallback((error: string) => {
    setErrors(prev => [...prev, error])
  }, [])

  const removeError = useCallback((error: string) => {
    setErrors(prev => prev.filter(e => e !== error))
  }, [])

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    addError,
    removeError,
    setErrors
  }
}

// Common validation rules
export const commonValidationRules = {
  required: (message: string = 'This field is required') => ({
    validate: (value: any) => value !== null && value !== undefined && value !== '',
    message
  }),
  
  minLength: (min: number, message?: string) => ({
    validate: (value: string) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),
  
  maxLength: (max: number, message?: string) => ({
    validate: (value: string) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`
  }),
  
  minValue: (min: number, message?: string) => ({
    validate: (value: number) => !value || value >= min,
    message: message || `Must be at least ${min}`
  }),
  
  maxValue: (max: number, message?: string) => ({
    validate: (value: number) => !value || value <= max,
    message: message || `Must be no more than ${max}`
  }),
  
  email: (message: string = 'Must be a valid email address') => ({
    validate: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),
  
  phoneNumber: (message: string = 'Must be a valid phone number') => ({
    validate: (value: string) => !value || /^\+?[\d\s\-\(\)]+$/.test(value),
    message
  }),
  
  percentage: (message: string = 'Must be a valid percentage (0-100)') => ({
    validate: (value: number) => !value || (value >= 0 && value <= 100),
    message
  })
}

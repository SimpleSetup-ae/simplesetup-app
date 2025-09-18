'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
// Import Cookies dynamically to avoid webpack issues
const getCookies = async () => {
  const Cookies = (await import('js-cookie')).default
  return Cookies
}

interface ApplicationData {
  id?: string
  draft_token?: string
  status?: string
  formation_step?: string
  completion_percentage?: number
  
  // Form data fields
  trade_license_validity?: number
  visa_package?: number
  partner_visa_count?: number
  inside_country_visas?: number
  outside_country_visas?: number
  establishment_card?: boolean
  require_investor_or_partner_visa?: string
  
  share_capital?: number
  share_value?: number
  total_shares?: number
  voting_rights_proportional?: boolean
  voting_rights_notes?: string
  shareholding_type?: string
  
  main_activity_id?: string
  business_activities?: any[]
  request_custom_activity?: boolean
  custom_activity_description?: string
  countries_of_operation?: string[]
  operate_as_franchise?: boolean
  franchise_details?: string
  
  name_options?: string[]
  name_arabic?: string
  
  shareholders?: any[]
  directors?: any[]
  general_manager?: any
  ubos?: any[]
  
  gm_signatory_name?: string
  gm_signatory_email?: string
  ubo_terms_accepted?: boolean
  accept_activity_rules?: boolean
  
  documents?: any[]
}

interface ApplicationProgress {
  step: number
  percent: number
  current_page?: string
}

interface ApplicationContextType {
  applicationData: ApplicationData
  progress: ApplicationProgress
  loading: boolean
  error: string | null
  
  // Actions
  createApplication: () => Promise<void>
  loadApplication: (id: string) => Promise<void>
  updateApplication: (data: Partial<ApplicationData>, stepName?: string) => Promise<void>
  updateProgress: (step: number, page: string) => Promise<void>
  submitApplication: () => Promise<{ success: boolean; errors?: string[] }>
  
  // Utilities
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (value: boolean) => void
  getCurrentStep: () => string
  getNextStep: () => string
  getPreviousStep: () => string
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

const STEPS = ['start', 'license', 'activities', 'names', 'shareholding', 'members', 'ubos', 'review']

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applicationData, setApplicationData] = useState<ApplicationData>({})
  const [progress, setProgress] = useState<ApplicationProgress>({ step: 0, percent: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const router = useRouter()
  
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Load existing application from cookies on mount
  useEffect(() => {
    const loadExistingApplication = async () => {
      const Cookies = await getCookies()
      const draftToken = Cookies.get('draft_token')
      const applicationId = localStorage.getItem('current_application_id')
    
      if (applicationId) {
        loadApplication(applicationId)
      } else if (draftToken) {
        // Try to find application by draft token
        fetch(`http://localhost:3001/api/v1/applications?draft_token=${draftToken}`, {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.application) {
              setApplicationData(data.application)
              setProgress(data.progress || { step: 0, percent: 0 })
            }
          })
          .catch(err => console.error('Failed to load draft:', err))
      }
    }
    
    loadExistingApplication()
  }, [])
  
  // Create new application
  const createApplication = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          free_zone: 'IFZA',
          formation_type: 'new_company' 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setApplicationData({ 
          id: data.application_id,
          draft_token: data.draft_token
        })
        
        // Store in localStorage and cookies
        localStorage.setItem('current_application_id', data.application_id)
        const Cookies = await getCookies()
        Cookies.set('draft_token', data.draft_token, { expires: 30 })
        
        // Navigate to first step
        router.push(`/application/${data.application_id}/license`)
      } else {
        setError(data.message || 'Failed to create application')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Create application error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Load existing application
  const loadApplication = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:3001/api/v1/applications/${id}`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setApplicationData(data.application)
        setProgress(data.application.progress || { step: 0, percent: 0 })
      } else {
        setError(data.message || 'Failed to load application')
      }
    } catch (err) {
      setError('Failed to load application')
      console.error('Load application error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Update application with auto-save
  const updateApplication = useCallback(async (data: Partial<ApplicationData>, stepName?: string) => {
    // Update local state immediately (optimistic update)
    setApplicationData(prev => ({ ...prev, ...data }))
    setHasUnsavedChanges(true)
    
    // Clear existing auto-save timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    
    // Set new auto-save timer (1.5 seconds debounce)
    const timer = setTimeout(async () => {
      if (!applicationData.id) return
      
      try {
        const response = await fetch(`http://localhost:3001/api/v1/applications/${applicationData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...data,
            form_data: data,
            step_name: stepName
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          setHasUnsavedChanges(false)
        }
      } catch (err) {
        console.error('Auto-save error:', err)
      }
    }, 1500)
    
    setAutoSaveTimer(timer)
  }, [applicationData.id, autoSaveTimer])
  
  // Update progress
  const updateProgress = async (step: number, page: string) => {
    if (!applicationData.id) return
    
    const newProgress = {
      step,
      percent: Math.round((step / 7) * 100),
      current_page: page
    }
    
    setProgress(newProgress)
    
    try {
      await fetch(`http://localhost:3001/api/v1/applications/${applicationData.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProgress)
      })
    } catch (err) {
      console.error('Progress update error:', err)
    }
  }
  
  // Submit application
  const submitApplication = async () => {
    if (!applicationData.id) {
      return { success: false, errors: ['No application to submit'] }
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // First, force flush any pending auto-save data
      // This ensures all form data is saved to backend before submission
      const flushResponse = await fetch(`http://localhost:3001/api/v1/applications/${applicationData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          form_data: applicationData,
          step_name: 'final_flush'  // Special marker for final data flush
        })
      })
      
      if (!flushResponse.ok) {
        console.error('Failed to flush data before submission')
      }
      
      // Small delay to ensure database write completes
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Now submit the application
      const response = await fetch(`http://localhost:3001/api/v1/applications/${applicationData.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setApplicationData(prev => ({ ...prev, status: 'submitted' }))
        return { success: true }
      } else {
        setError(data.message || 'Submission failed')
        return { success: false, errors: data.errors || ['Submission failed'] }
      }
    } catch (err) {
      setError('Network error during submission')
      return { success: false, errors: ['Network error'] }
    } finally {
      setLoading(false)
    }
  }
  
  // Navigation helpers
  const getCurrentStep = () => {
    return progress.current_page || 'start'
  }
  
  const getNextStep = () => {
    const currentIndex = STEPS.indexOf(getCurrentStep())
    if (currentIndex < STEPS.length - 1) {
      return STEPS[currentIndex + 1]
    }
    return 'review'
  }
  
  const getPreviousStep = () => {
    const currentIndex = STEPS.indexOf(getCurrentStep())
    if (currentIndex > 0) {
      return STEPS[currentIndex - 1]
    }
    return 'start'
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [autoSaveTimer])
  
  const value: ApplicationContextType = {
    applicationData,
    progress,
    loading,
    error,
    createApplication,
    loadApplication,
    updateApplication,
    updateProgress,
    submitApplication,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    getCurrentStep,
    getNextStep,
    getPreviousStep
  }
  
  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplication() {
  const context = useContext(ApplicationContext)
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider')
  }
  return context
}

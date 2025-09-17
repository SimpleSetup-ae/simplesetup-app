'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { apiPost } from '@/lib/api'

interface PassportData {
  first_name: string
  middle_name: string
  last_name: string
  gender: 'Male' | 'Female'
  date_of_birth: string
  passport_number: string
  passport_issue_date: string
  passport_expiry_date: string
  passport_issue_country: string
  passport_issue_place: string
  nationality: string
  mrz_line_1: string
  mrz_line_2: string
}

interface PassportUploadProps {
  applicationId: string
  personId: string
  onExtractedData: (data: Partial<PassportData>) => void
  onError: (error: string) => void
  disabled?: boolean
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

export function PassportUpload({ 
  applicationId, 
  personId, 
  onExtractedData, 
  onError,
  disabled = false 
}: PassportUploadProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [fileName, setFileName] = useState<string>('')
  const [confidence, setConfidence] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB')
      return
    }

    setFileName(file.name)
    setState('uploading')
    setUploadProgress(0)
    setProcessingProgress(0)

    try {
      await uploadAndExtract(file)
    } catch (error) {
      setState('error')
      onError(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const uploadAndExtract = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('person_id', personId)

    // Create XMLHttpRequest for upload progress tracking
    const xhr = new XMLHttpRequest()

    return new Promise<void>((resolve, reject) => {
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      // Handle upload completion and start processing
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setState('processing')
          setUploadProgress(100)
          
          // Simulate processing progress (since we can't track AI processing)
          simulateProcessingProgress()
          
          try {
            const response = JSON.parse(xhr.responseText)
            handleExtractionResponse(response)
            resolve()
          } catch (error) {
            reject(new Error('Failed to parse response'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'))
      })

      // Configure and send request
      xhr.timeout = 60000 // 60 second timeout
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      xhr.open('POST', `${apiUrl}/applications/${applicationId}/documents/extract_passport`)
      xhr.send(formData)
    })
  }

  const simulateProcessingProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5 // Increment by 5-20%
      if (progress >= 95) {
        progress = 95 // Stop at 95% until we get the actual response
        clearInterval(interval)
      }
      setProcessingProgress(Math.min(progress, 95))
    }, 200)

    // Cleanup interval after 30 seconds max
    setTimeout(() => clearInterval(interval), 30000)
  }

  const handleExtractionResponse = (response: any) => {
    setProcessingProgress(100)
    
    if (response.success && response.extracted) {
      setState('completed')
      setConfidence(response.confidence || 0)
      
      // Map the extracted data to the expected format
      const extractedData: Partial<PassportData> = {
        first_name: response.extracted.first_name || '',
        middle_name: response.extracted.middle_name || '',
        last_name: response.extracted.last_name || '',
        gender: response.extracted.gender === 'M' ? 'Male' : 
                response.extracted.gender === 'F' ? 'Female' : 
                response.extracted.gender as 'Male' | 'Female',
        date_of_birth: response.extracted.date_of_birth || '',
        passport_number: response.extracted.passport_number || '',
        passport_issue_date: response.extracted.passport_issue_date || '',
        passport_expiry_date: response.extracted.passport_expiry_date || '',
        passport_issue_country: response.extracted.passport_issue_country || '',
        passport_issue_place: response.extracted.passport_issue_place || '',
        nationality: response.extracted.nationality || ''
      }

      onExtractedData(extractedData)

      // Show warning if confidence is low
      if (response.confidence < 80) {
        onError(`Extraction confidence: ${response.confidence}%. Please verify all fields carefully.`)
      }
    } else {
      setState('error')
      onError(response.message || 'Failed to extract passport information')
    }
  }

  const resetUpload = () => {
    setState('idle')
    setUploadProgress(0)
    setProcessingProgress(0)
    setFileName('')
    setConfidence(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusIcon = () => {
    switch (state) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (state) {
      case 'uploading':
        return `Uploading ${fileName}... ${uploadProgress}%`
      case 'processing':
        return `Processing with GPT-5... ${Math.round(processingProgress)}%`
      case 'completed':
        return `Extraction completed (${confidence}% confidence)`
      case 'error':
        return 'Extraction failed'
      default:
        return 'Upload passport for AI extraction'
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || state === 'uploading' || state === 'processing'}
          className="hidden"
        />
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon()}
            <span className="ml-2 text-sm font-medium">{getStatusText()}</span>
          </div>

          {state === 'idle' && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Passport Image
            </Button>
          )}

          {(state === 'uploading' || state === 'processing') && (
            <div className="space-y-3 mt-4">
              {state === 'uploading' && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {state === 'processing' && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>AI Processing with GPT-5...</span>
                    <span>{Math.round(processingProgress)}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              )}
            </div>
          )}

          {state === 'completed' && (
            <div className="mt-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Passport data extracted successfully! Confidence: {confidence}%
                </AlertDescription>
              </Alert>
              <Button
                onClick={resetUpload}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Upload Another
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="mt-4">
              <Button
                onClick={resetUpload}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>Supported formats: JPG, PNG, WebP • Max size: 10MB</p>
        <p>AI will extract: Name, passport number, dates, nationality, etc.</p>
      </div>
    </div>
  )
}

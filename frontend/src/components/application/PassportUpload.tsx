'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
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
  onProcessingStart?: () => void
  onProcessingEnd?: () => void
  disabled?: boolean
  existingData?: Partial<PassportData> // Pre-populated passport data
  showUploadedState?: boolean // Show as already uploaded
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

export function PassportUpload({ 
  applicationId, 
  personId, 
  onExtractedData, 
  onError,
  onProcessingStart,
  onProcessingEnd,
  disabled = false,
  existingData,
  showUploadedState = false
}: PassportUploadProps) {
  const [state, setState] = useState<UploadState>(showUploadedState ? 'completed' : 'idle')
  const [uploadProgress, setUploadProgress] = useState(showUploadedState ? 100 : 0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [fileName, setFileName] = useState<string>(showUploadedState ? 'passport.jpg' : '')
  const [confidence, setConfidence] = useState<number>(showUploadedState ? 100 : 0)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Set thumbnail dimensions (max 200px width/height)
        const maxSize = 200
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

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

    // Notify parent that processing started (including upload + AI)
    onProcessingStart?.()

    // Generate thumbnail
    const thumbnail = await generateThumbnail(file)
    setThumbnailUrl(thumbnail)

    try {
      await uploadAndExtract(file)
    } catch (error) {
      setState('error')
      onProcessingEnd?.() // End processing on upload error
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
      // Track upload progress (0-35%)
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const uploadPercent = (event.loaded / event.total) * 35 // Upload is 35% of total
          setUploadProgress(Math.round(uploadPercent))
        }
      })

      // Handle upload completion and start processing
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setState('processing')
          setUploadProgress(35) // Upload complete, now start AI processing
          
          // Start AI extraction progress simulation (35% to 100%)
          simulateAIExtractionProgress()
          
          try {
            const response = JSON.parse(xhr.responseText)
            handleExtractionResponse(response)
            resolve()
          } catch (error) {
            reject(new Error('Failed to parse response'))
          }
        } else {
          onProcessingEnd?.() // End processing on error
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        onProcessingEnd?.() // End processing on error
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        onProcessingEnd?.() // End processing on timeout
        reject(new Error('Upload timeout'))
      })

      // Configure and send request
      xhr.timeout = 60000 // 60 second timeout
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      xhr.open('POST', `${apiUrl}/applications/${applicationId}/documents/extract_passport`)
      xhr.send(formData)
    })
  }

  const simulateAIExtractionProgress = () => {
    let currentProgress = 35 // Start from upload completion
    const interval = setInterval(() => {
      // Simulate AI processing steps with realistic timing
      const increment = Math.random() * 8 + 3 // Increment by 3-11%
      currentProgress += increment
      
      if (currentProgress >= 95) {
        currentProgress = 95 // Stop at 95% until we get the actual response
        clearInterval(interval)
      }
      
      setUploadProgress(Math.min(currentProgress, 95))
    }, 400) // Slower intervals for AI processing feel

    // Cleanup interval after 45 seconds max (AI processing can take longer)
    setTimeout(() => clearInterval(interval), 45000)
    
    return interval
  }

  const handleExtractionResponse = (response: any) => {
    setUploadProgress(100) // AI extraction complete
    
    // Notify parent that processing ended
    onProcessingEnd?.()
    
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
      onProcessingEnd?.() // End processing on extraction failure
      onError(response.message || 'Failed to extract passport information')
    }
  }

  const resetUpload = () => {
    setState('idle')
    setUploadProgress(0)
    setProcessingProgress(0)
    setFileName('')
    setConfidence(0)
    setThumbnailUrl('')
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
        return `Uploading... ${uploadProgress}%`
      case 'processing':
        return `Processing... ${uploadProgress}%`
      case 'completed':
        return `Extraction completed (${confidence}% confidence)`
      case 'error':
        return 'Extraction failed'
      default:
        return 'Upload passport for AI extraction'
    }
  }

  // If showing uploaded state (existing person data), show completed view
  if (showUploadedState && existingData) {
    return (
      <div className="space-y-4">
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-800">
                Passport data already available
              </span>
            </div>
            
            {/* Show extracted data summary */}
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="font-medium">Name:</span> {existingData.first_name} {existingData.last_name}
                </div>
                <div>
                  <span className="font-medium">Passport:</span> {existingData.passport_number || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Nationality:</span> {existingData.nationality || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">DOB:</span> {existingData.date_of_birth || 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Option to re-upload */}
            <Button
              onClick={() => {
                setState('idle')
                setUploadProgress(0)
                setConfidence(0)
                setThumbnailUrl('')
              }}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Upload Different Passport
            </Button>
          </div>
        </div>
      </div>
    )
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
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {uploadProgress < 35 ? 'Uploading...' : 'Processing...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
              </div>
            </div>
          )}

          {state === 'completed' && thumbnailUrl && (
            <div className="mt-4 space-y-3">
              {/* Thumbnail with delete button */}
              <div className="relative inline-block">
                <img 
                  src={thumbnailUrl} 
                  alt="Passport thumbnail"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                />
                <Button
                  onClick={resetUpload}
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Success message */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Passport data extracted successfully! Confidence: {confidence}%
                </AlertDescription>
              </Alert>
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

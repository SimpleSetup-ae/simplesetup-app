'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PassportData {
  document_number: string | null
  issuing_country: string | null
  nationality: string | null
  names: {
    surname: string | null
    given_names: string | null
  }
  personal_information: {
    date_of_birth: string | null
    gender: string | null
  }
  validity: {
    issue_date: string | null
    expiry_date: string | null
  }
  fraud_assessment?: {
    risk_score: number
    risk_band: 'low' | 'medium' | 'high' | 'critical'
    top_factors: string[]
  }
}

interface PassportUploadProps {
  entityType: 'shareholder' | 'director' | 'owner'
  entityName?: string
  required?: boolean
  onUpload: (file: File, data: PassportData) => void
  onCancel?: () => void
  className?: string
}

export function PassportUpload({
  entityType,
  entityName,
  required = true,
  onUpload,
  onCancel,
  className
}: PassportUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<PassportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      e.dataTransfer.dropEffect = 'copy'
    } catch (_) {}
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        // For PDF, we'll use a placeholder icon for now
        // In production, you'd use a PDF.js library to extract the first page
        resolve('/api/placeholder/150/200')
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              reject(new Error('Could not get canvas context'))
              return
            }
            
            // Create thumbnail with aspect ratio preservation
            const maxWidth = 150
            const maxHeight = 200
            let width = img.width
            let height = img.height
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }
            
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.8))
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const processFile = async (file: File) => {
    console.log('🚀 Starting passport processing for file:', file.name, file.type, file.size)
    setIsProcessing(true)
    setStep('processing')
    setProgress(0)
    setError(null)

    try {
      // Generate thumbnail
      setProgress(10)
      const thumbnailUrl = await generateThumbnail(file)
      setThumbnail(thumbnailUrl)
      
      // Convert file to base64
      setProgress(20)
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Extract base64 data from data URL
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      // Step 1: Extract passport data
      setProgress(30)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      console.log('📤 Sending extract request to:', `${baseUrl}/api/v1/documents/passport/extract`)
      console.log('📄 File base64 length:', fileBase64.length)
      
      const extractResponse = await fetch(`${baseUrl}/api/v1/documents/passport/extract`, {
        method: 'POST',
        body: JSON.stringify({
          file: fileBase64,
          entity_type: entityType,
          entity_name: entityName
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!extractResponse.ok) {
        const errorText = await extractResponse.text()
        console.error('❌ Extract response error:', extractResponse.status, errorText)
        throw new Error(`Failed to extract passport data: ${extractResponse.status} ${errorText}`)
      }
      
      const extractData = await extractResponse.json()
      console.log('✅ Extract response received:', extractData)
      setProgress(60)
      
      // Step 2: Fraud detection
      const fraudResponse = await fetch(`${baseUrl}/api/v1/documents/passport/fraud-check`, {
        method: 'POST',
        body: JSON.stringify({ 
          passport_data: extractData.passport,
          file_id: extractData.file_id 
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!fraudResponse.ok) {
        throw new Error('Failed to perform fraud check')
      }
      
      const fraudData = await fraudResponse.json()
      setProgress(90)
      
      // Combine extracted data with fraud assessment
      const combinedData: PassportData = {
        document_number: extractData.passport.document_number?.value,
        issuing_country: extractData.passport.issuing_country?.value,
        nationality: extractData.passport.nationality?.value,
        names: {
          surname: extractData.passport.names?.surname?.final,
          given_names: extractData.passport.names?.given_names?.final
        },
        personal_information: {
          date_of_birth: extractData.passport.personal_information?.date_of_birth?.final,
          gender: extractData.passport.personal_information?.gender?.value
        },
        validity: {
          issue_date: extractData.passport.validity?.issue_date?.value,
          expiry_date: extractData.passport.validity?.expiry_date?.final
        },
        fraud_assessment: fraudData.fraud_assessment
      }
      
      setExtractedData(combinedData)
      setProgress(100)
      setStep('review')
      
    } catch (err) {
      console.error('💥 Passport processing error:', err)
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      setError(err instanceof Error ? err.message : 'An error occurred while processing the passport')
      setStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    console.log('File dropped:', e.dataTransfer.files)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isValidFile(droppedFile)) {
      console.log('Valid file dropped:', droppedFile.name)
      setFile(droppedFile)
      await processFile(droppedFile)
    } else {
      console.log('Invalid file:', droppedFile?.name, droppedFile?.type)
      setError('Please upload a valid image file (JPG, PNG) or PDF')
    }
  }, [])

  const openFileDialog = useCallback(() => {
    const input = fileInputRef.current
    if (!input) return
    // Prefer showPicker when available (better on Safari/iOS)
    // Fallback to .click()
    // Some browsers block programmatic click on fully hidden inputs; we also expose a label htmlFor below.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyInput = input as any
    if (typeof anyInput.showPicker === 'function') {
      try {
        anyInput.showPicker()
        return
      } catch (_) {
        // fall through to click
      }
    }
    input.click()
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files)
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFile(selectedFile)) {
      console.log('Valid file selected:', selectedFile.name)
      setFile(selectedFile)
      await processFile(selectedFile)
    } else {
      console.log('Invalid file selected:', selectedFile?.name, selectedFile?.type)
      setError('Please upload a valid image file (JPG, PNG) or PDF')
    }
  }

  const isValidFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    const maxSize = 10 * 1024 * 1024 // 10MB
    return validTypes.includes(file.type) && file.size <= maxSize
  }

  const handleRemoveFile = () => {
    setFile(null)
    setThumbnail(null)
    setExtractedData(null)
    setError(null)
    setStep('upload')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConfirm = () => {
    if (file && extractedData) {
      onUpload(file, extractedData)
      setStep('complete')
    }
  }

  const getRiskBandColor = (band: string) => {
    switch (band) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>
          Passport Upload {entityName && `- ${entityName}`}
        </CardTitle>
        <CardDescription>
          Upload passport for {entityType}
          {required && <span className="text-red-500 ml-1">*</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'upload' && (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300',
              'hover:border-primary hover:bg-gray-50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            onClick={(e) => {
              // Avoid triggering when clicking the remove button
              const target = e.target as HTMLElement
              if (target.closest('button')) return
              openFileDialog()
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openFileDialog()
              }
            }}
          >
            {thumbnail ? (
              <div className="relative inline-block">
                <img 
                  src={thumbnail} 
                  alt="Passport thumbnail" 
                  className="max-w-[150px] max-h-[200px] rounded-lg shadow-md"
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop your passport here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, PDF (Max 10MB)
                </p>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              id="passport-upload-input"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button asChild type="button" variant="outline" className="mt-4">
              <label htmlFor="passport-upload-input" onClick={(e) => e.stopPropagation()}>
                {thumbnail ? 'Change File' : 'Select File'}
              </label>
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing passport...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            <p className="text-center text-sm text-gray-600">
              {progress < 30 && 'Generating thumbnail...'}
              {progress >= 30 && progress < 60 && 'Extracting passport data...'}
              {progress >= 60 && progress < 90 && 'Performing fraud detection...'}
              {progress >= 90 && 'Finalizing...'}
            </p>
            {thumbnail && (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={thumbnail}
                  alt="Preview"
                  className="max-w-[150px] max-h-[200px] rounded-md shadow"
                />
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            )}
          </div>
        )}

        {step === 'review' && extractedData && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Please review and confirm the extracted information
              </AlertDescription>
            </Alert>

            {extractedData.fraud_assessment && (
              <div className={cn(
                'rounded-lg p-3',
                getRiskBandColor(extractedData.fraud_assessment.risk_band)
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Fraud Risk Assessment:</span>
                  <span className="font-bold uppercase">
                    {extractedData.fraud_assessment.risk_band}
                  </span>
                </div>
                {extractedData.fraud_assessment.risk_band !== 'low' && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium">Risk factors:</p>
                    <ul className="list-disc list-inside mt-1">
                      {extractedData.fraud_assessment.top_factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm mt-1">
                  {extractedData.names.given_names} {extractedData.names.surname}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Passport Number</Label>
                <p className="text-sm mt-1">{extractedData.document_number || 'Not detected'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Date of Birth</Label>
                <p className="text-sm mt-1">
                  {extractedData.personal_information.date_of_birth || 'Not detected'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Nationality</Label>
                <p className="text-sm mt-1">{extractedData.nationality || 'Not detected'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Issue Date</Label>
                <p className="text-sm mt-1">
                  {extractedData.validity.issue_date || 'Not detected'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Expiry Date</Label>
                <p className="text-sm mt-1">
                  {extractedData.validity.expiry_date || 'Not detected'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleConfirm}
                className="flex-1"
                disabled={extractedData.fraud_assessment?.risk_band === 'critical'}
              >
                Confirm Information
              </Button>
              <Button
                onClick={handleRemoveFile}
                variant="outline"
                className="flex-1"
              >
                Upload Different Passport
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-4 text-lg font-medium">Passport Uploaded Successfully</p>
            <p className="text-sm text-gray-600 mt-2">
              The passport has been verified and saved
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

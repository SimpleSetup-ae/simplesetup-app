'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  uploaded_at: string
}

export default function DocumentUploadInterface() {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([
    {
      id: '1',
      name: 'passport_john_doe.pdf',
      type: 'passport_copy',
      size: 2.4,
      status: 'completed',
      progress: 100,
      uploaded_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'utility_bill_december.pdf',
      type: 'utility_bill',
      size: 1.8,
      status: 'processing',
      progress: 75,
      uploaded_at: '2024-01-15T11:00:00Z'
    }
  ])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const newDocument: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'unknown',
        size: Number((file.size / 1024 / 1024).toFixed(1)),
        status: 'uploading',
        progress: 0,
        uploaded_at: new Date().toISOString()
      }
      
      setUploadedDocuments(prev => [...prev, newDocument])
      
      // Simulate upload progress
      simulateUpload(newDocument.id)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  })

  const simulateUpload = (documentId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'processing', progress: 100 }
              : doc
          )
        )
        
        // Simulate OCR processing
        setTimeout(() => {
          setUploadedDocuments(prev => 
            prev.map(doc => 
              doc.id === documentId 
                ? { ...doc, status: 'completed' }
                : doc
            )
          )
        }, 2000)
      } else {
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, progress }
              : doc
          )
        )
      }
    }, 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-orange-600 bg-orange-100'
      case 'uploading': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'passport_copy': 'Passport Copy',
      'emirates_id_copy': 'Emirates ID Copy',
      'utility_bill': 'Utility Bill',
      'noc_letter': 'NOC Letter',
      'unknown': 'Unknown Document'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-8">
      {/* Upload Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Drag and drop files or click to browse. Supports PDF, images, and office documents up to 50MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragActive 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-gray-300 hover:border-orange-300 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-4xl">📄</div>
              {isDragActive ? (
                <p className="text-orange-600 font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium mb-2">
                    Drag & drop your documents here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: PDF, JPG, PNG, DOC, DOCX • Max size: 50MB per file
                  </p>
                </div>
              )}
              <Button variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            {uploadedDocuments.length} document(s) uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {doc.name.toLowerCase().includes('pdf') ? '📄' : 
                         doc.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? '🖼️' : '📋'}
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{getDocumentTypeLabel(doc.type)}</span>
                          <span>{doc.size} MB</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar for uploading documents */}
                    {doc.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={doc.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">Uploading... {Math.round(doc.progress)}%</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status === 'uploading' ? 'Uploading' :
                       doc.status === 'processing' ? 'Processing' :
                       doc.status === 'completed' ? 'Completed' :
                       doc.status === 'failed' ? 'Failed' : doc.status}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                      {doc.status === 'failed' && (
                        <Button variant="outline" size="sm" className="text-orange-600">
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Make sure you have all required documents for IFZA company formation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'passport_copy', title: 'Passport Copies', required: true, uploaded: true },
              { type: 'emirates_id_copy', title: 'Emirates ID Copies', required: false, uploaded: false },
              { type: 'utility_bill', title: 'Utility Bill', required: true, uploaded: true },
              { type: 'noc_letter', title: 'NOC Letter', required: false, uploaded: false }
            ].map((req) => (
              <div key={req.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{req.title}</p>
                  <p className="text-sm text-gray-600">
                    {req.required ? 'Required' : 'Optional'}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  req.uploaded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {req.uploaded ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

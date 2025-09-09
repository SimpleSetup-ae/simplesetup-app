'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, File, X, Eye, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormStep } from '../components/FormStep'
import { ValidationResult } from '../types/FormConfig'

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: 'passport' | 'corporate_document' | 'other';
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  previewUrl?: string;
  personId?: string; // Link to specific person if applicable
  serverId?: string; // Server-side document ID
  displayUrl?: string; // URL from server
  uploadError?: string; // Error message
}

interface DocumentUploadStepProps {
  uploadedFiles: UploadedFile[];
  requiredDocuments: string[];
  companyId: string;
  onFilesChange: (files: UploadedFile[] | ((prevFiles: UploadedFile[]) => UploadedFile[])) => void;
  onValidationChange: (result: ValidationResult) => void;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

export function DocumentUploadStep({
  uploadedFiles = [],
  requiredDocuments = ['Passport copies for all individuals'],
  companyId,
  onFilesChange,
  onValidationChange,
  maxFileSize = 10,
  allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf']
}: DocumentUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${maxFileSize}MB)`);
        return;
      }

      // Validate file type
      if (!allowedFileTypes.includes(file.type)) {
        errors.push(`${file.name} has unsupported file type`);
        return;
      }

      // Determine category based on filename or user selection
      const category: UploadedFile['category'] = 
        file.name.toLowerCase().includes('passport') ? 'passport' : 'other';

      const uploadedFile: UploadedFile = {
        id: `file_${Date.now()}_${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        uploadProgress: 0,
        uploadStatus: 'pending'
      };

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        uploadedFile.previewUrl = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    });

    setUploadErrors(errors);

    if (newFiles.length > 0) {
      const allFiles = [...uploadedFiles, ...newFiles];
      onFilesChange(allFiles);

      // Upload files to Supabase storage
      newFiles.forEach(file => {
        uploadFile(file.id, file.file, file.category, companyId);
      });
    }
  }, [uploadedFiles, onFilesChange, maxFileSize, allowedFileTypes]);

  // Upload file to Supabase storage via API
  const uploadFile = async (fileId: string, file: File, category: string, companyId: string) => {
    const updateFileProgress = (progress: number, status: UploadedFile['uploadStatus'], error?: string) => {
      onFilesChange((prevFiles: UploadedFile[]) => 
        prevFiles.map((f: UploadedFile) => 
          f.id === fileId 
            ? { ...f, uploadProgress: progress, uploadStatus: status, uploadError: error }
            : f
        )
      );
    };

    updateFileProgress(0, 'uploading');

    try {
      const formData = new FormData();
      formData.append('files[]', file);
      formData.append('document_category', category);

      // Simulate progress during upload
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress < 90) {
          updateFileProgress(progress, 'uploading');
        }
      }, 300);

      const response = await fetch(`/api/v1/companies/${companyId}/documents`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type - let browser set it for FormData
          'Accept': 'application/json'
        }
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const uploadedDoc = result.data[0];
        updateFileProgress(100, 'completed');
        
        // Update file with server response data
        onFilesChange((prevFiles: UploadedFile[]) => 
          prevFiles.map((f: UploadedFile) => 
            f.id === fileId 
              ? { 
                  ...f, 
                  uploadProgress: 100, 
                  uploadStatus: 'completed',
                  serverId: uploadedDoc.id,
                  displayUrl: uploadedDoc.display_url
                }
              : f
          )
        );
      } else {
        const errorMsg = result.errors?.[0]?.error || result.message || 'Upload failed';
        updateFileProgress(0, 'error', errorMsg);
      }
    } catch (error) {
      updateFileProgress(0, 'error', `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    onFilesChange(newFiles);
  };

  // Update file category
  const updateFileCategory = (fileId: string, category: UploadedFile['category']) => {
    const newFiles = uploadedFiles.map(file => 
      file.id === fileId ? { ...file, category } : file
    );
    onFilesChange(newFiles);
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Validation
  React.useEffect(() => {
    const errors: string[] = [];
    
    const passportFiles = uploadedFiles.filter(f => f.category === 'passport');
    if (passportFiles.length === 0) {
      errors.push('At least one passport document is required');
    }

    const failedUploads = uploadedFiles.filter(f => f.uploadStatus === 'error');
    if (failedUploads.length > 0) {
      errors.push(`${failedUploads.length} file(s) failed to upload`);
    }

    const uploadingFiles = uploadedFiles.filter(f => f.uploadStatus === 'uploading');
    if (uploadingFiles.length > 0) {
      errors.push('Please wait for all files to finish uploading');
    }

    onValidationChange({
      valid: errors.length === 0,
      errors: [...errors, ...uploadErrors]
    });
  }, [uploadedFiles, uploadErrors, onValidationChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <FormStep
      title="Upload documents"
      subtitle="Passport and supporting documents"
    >
      <div className="space-y-6">
        {/* Required Documents List */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Required Documents</h3>
          <ul className="space-y-1">
            {requiredDocuments.map((doc, index) => (
              <li key={index} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {/* Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-muted-foreground mb-4">
            Support for JPEG, PNG, PDF files up to {maxFileSize}MB each
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="mb-2"
          >
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedFileTypes.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Upload Errors */}
        {uploadErrors.length > 0 && (
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {uploadErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="space-y-3">
              {uploadedFiles.map(file => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* File Preview */}
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {file.previewUrl ? (
                          <img 
                            src={file.previewUrl} 
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <File className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          {file.uploadStatus === 'completed' && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type}
                        </p>

                        {/* Upload Progress */}
                        {file.uploadStatus === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={file.uploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploading... {Math.round(file.uploadProgress)}%
                            </p>
                          </div>
                        )}

                        {/* Category Selection */}
                        <div className="mt-2">
                          <select
                            value={file.category}
                            onChange={(e) => updateFileCategory(file.id, e.target.value as UploadedFile['category'])}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="passport">Passport Document</option>
                            <option value="corporate_document">Corporate Document</option>
                            <option value="other">Other Document</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {file.previewUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.previewUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{uploadedFiles.length}</div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {uploadedFiles.filter(f => f.uploadStatus === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {uploadedFiles.filter(f => f.category === 'passport').length}
              </div>
              <div className="text-sm text-muted-foreground">Passport Docs</div>
            </div>
          </div>
        </div>
      </div>
    </FormStep>
  );
}

import DocumentUploadInterface from '@/components/documents/document-upload-interface'

// Temporarily disable auth check for testing  
export default async function DocumentsPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Upload and manage your company formation documents</p>
      </div>
      
      <DocumentUploadInterface />
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'

export default function TestUploadPage() {
  const [message, setMessage] = useState('Component loaded')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    console.log('Button clicked!')
    setMessage('Button clicked at ' + new Date().toLocaleTimeString())
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('File selected:', file)
    setMessage(file ? `File selected: ${file.name}` : 'No file selected')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Upload Test</h1>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Status: {message}</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf"
          />
          
          <button
            onClick={handleClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Select File
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              console.log('Test button clicked')
              setMessage('Test clicked at ' + new Date().toLocaleTimeString())
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Button
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Check browser console for logs</p>
          <p>Current time: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { PassportUpload } from '@/components/workflow/documents/PassportUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PassportDemoPage() {
  const [uploadedPassports, setUploadedPassports] = useState<any[]>([])

  const handlePassportUpload = (file: File, data: any) => {
    console.log('Passport uploaded:', { file, data })
    setUploadedPassports([...uploadedPassports, { file, data, timestamp: new Date() }])
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Passport Upload Demo</h1>
        <p className="text-gray-600">
          Test the passport upload component with OCR extraction and fraud detection
        </p>
      </div>

      <div className="space-y-6">
        <PassportUpload
          entityType="shareholder"
          entityName="John Doe"
          required={true}
          onUpload={handlePassportUpload}
        />

        {uploadedPassports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Passports</CardTitle>
              <CardDescription>
                Successfully processed passport documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedPassports.map((passport, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>{' '}
                        {passport.data.names?.given_names} {passport.data.names?.surname}
                      </div>
                      <div>
                        <span className="font-medium">Passport Number:</span>{' '}
                        {passport.data.document_number || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Nationality:</span>{' '}
                        {passport.data.nationality || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Risk Level:</span>{' '}
                        <span
                          className={`font-bold ${
                            passport.data.fraud_assessment?.risk_band === 'low'
                              ? 'text-green-600'
                              : passport.data.fraud_assessment?.risk_band === 'medium'
                              ? 'text-yellow-600'
                              : passport.data.fraud_assessment?.risk_band === 'high'
                              ? 'text-orange-600'
                              : 'text-red-600'
                          }`}
                        >
                          {passport.data.fraud_assessment?.risk_band?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Uploaded at: {passport.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

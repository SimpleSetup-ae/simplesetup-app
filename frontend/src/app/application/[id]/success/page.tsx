'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Download, Mail, Clock, ArrowRight } from 'lucide-react'

export default function SuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-xl text-gray-600">
            Your company formation application has been received
          </p>
        </div>
        
        <Card className="shadow-xl mb-8">
          <CardHeader className="text-center">
            <CardTitle>Application Reference</CardTitle>
            <CardDescription>
              <span className="text-2xl font-mono font-bold text-blue-600">
                {params.id.split('-')[0].toUpperCase()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What Happens Next */}
            <div>
              <h3 className="font-semibold mb-3">What Happens Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium">Application Review</p>
                    <p className="text-sm text-gray-600">Our team will review your application within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium">Document Verification</p>
                    <p className="text-sm text-gray-600">We'll verify all submitted documents and may request additional information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium">Payment Processing</p>
                    <p className="text-sm text-gray-600">You'll receive a payment link once your application is approved</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">4</span>
                  <div>
                    <p className="font-medium">Company Formation</p>
                    <p className="text-sm text-gray-600">Your company will be formed within 3-5 business days after payment</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Important Information */}
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Check Your Email</strong><br />
                We've sent a confirmation email with your application details and reference number.
                Please check your spam folder if you don't see it within a few minutes.
              </AlertDescription>
            </Alert>
            
            {/* Timeline */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                Expected Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Application Review:</span>
                  <span className="font-medium">24-48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Verification:</span>
                  <span className="font-medium">1-2 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Formation:</span>
                  <span className="font-medium">3-5 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License Issuance:</span>
                  <span className="font-medium">5-7 business days</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Support */}
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-2">
              Questions about your application?
            </p>
            <p className="font-medium">
              Contact our support team at{' '}
              <a href="mailto:support@simplesetup.ae" className="text-blue-600 hover:underline">
                support@simplesetup.ae
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please include your reference number: {params.id.split('-')[0].toUpperCase()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

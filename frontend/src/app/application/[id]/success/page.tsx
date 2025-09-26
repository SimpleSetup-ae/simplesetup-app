'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, FileText, Clock, CreditCard, Building, ArrowRight } from 'lucide-react'

export default function SuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  useEffect(() => {
    // Clear any saved application data from localStorage
    localStorage.removeItem('current_application_id')
    
    // Redirect to companies page after 10 seconds
    const timer = setTimeout(() => {
      router.push('/companies')
    }, 10000)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-xl text-gray-600">
            Your application ID: <span className="font-mono font-bold text-orange-600">
              {params.id.split('-')[0].toUpperCase()}
            </span>
          </p>
        </div>
        
        {/* Confirmation Details */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-gray-400 text-white">
            <CardTitle className="text-2xl">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">1. Document Review</h3>
                  <p className="text-gray-600">
                    Our team will review your submitted documents and information within 1-2 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">2. Name Approval</h3>
                  <p className="text-gray-600">
                    We'll verify the availability of your chosen company names with the free zone authority.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">3. Payment Request</h3>
                  <p className="text-gray-600">
                    Once approved, you'll receive a secure payment link to complete the registration fees.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">4. Company Formation</h3>
                  <p className="text-gray-600">
                    After payment confirmation, we'll complete the official registration and issue your trade license within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Important Information */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>A confirmation email has been sent to your registered email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You can track your application status in your dashboard at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Our team may contact you if additional information is required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Keep your application ID handy for future reference</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => router.push('/companies')}
            className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500"
          >
            View My Company
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </div>
        
        {/* Auto-redirect notice */}
        <p className="text-center text-sm text-gray-500 mt-8">
          You will be automatically redirected to your dashboard in a few seconds...
        </p>
      </div>
    </div>
  )
}
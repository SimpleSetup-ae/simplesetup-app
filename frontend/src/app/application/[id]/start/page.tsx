'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, CheckCircle, Shield, Clock, DollarSign } from 'lucide-react'

export default function StartPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { updateProgress, loadApplication, applicationData } = useApplication()
  
  useEffect(() => {
    // If we have an ID, load the application
    if (params.id && params.id !== 'new') {
      loadApplication(params.id)
    }
    updateProgress(0, 'start')
  }, [params.id])
  
  const handleStart = () => {
    router.push(`/application/${params.id}/license`)
  }
  
  return (
    <div className="min-h-screen brand-gradient-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="brand-gradient-text">Start Your UAE Company Formation</span>
          </h1>
          <p className="text-xl text-gray-700">
            Complete your application in just 15 minutes
          </p>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome to SimpleSetup</CardTitle>
            <CardDescription className="text-lg mt-2">
              The fastest way to establish your business in the UAE
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">100% Online Process</h3>
                  <p className="text-sm text-gray-600">No need to visit offices</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Confidential</h3>
                  <p className="text-sm text-gray-600">Your data is protected</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Auto-Save Progress</h3>
                  <p className="text-sm text-gray-600">Never lose your work</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="h-6 w-6 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Live Pricing</h3>
                  <p className="text-sm text-gray-600">See costs update in real-time</p>
                </div>
              </div>
            </div>
            
            {/* Process Overview */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">What You'll Need:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 brand-step-number rounded-full flex items-center justify-center text-lg font-bold">1</span>
                  <span className="text-gray-700">Business activity details</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 brand-step-number rounded-full flex items-center justify-center text-lg font-bold">2</span>
                  <span className="text-gray-700">Company name preferences (3 options)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 brand-step-number rounded-full flex items-center justify-center text-lg font-bold">3</span>
                  <span className="text-gray-700">Shareholder and director information</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 brand-step-number rounded-full flex items-center justify-center text-lg font-bold">4</span>
                  <span className="text-gray-700">Passport copies (we'll extract details automatically)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 brand-step-number rounded-full flex items-center justify-center text-lg font-bold">5</span>
                  <span className="text-gray-700">Supporting documents (if applicable)</span>
                </div>
              </div>
            </div>
            
            {/* Key Features */}
            <Alert className="bg-brand-50 border-brand-200">
              <AlertDescription className="text-brand-900">
                <strong className="text-brand-800">Smart Features:</strong>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li className="text-brand-800">First 3 business activities are free</li>
                  <li className="text-brand-800">Automatic Arabic translation for company names</li>
                  <li className="text-brand-800">AI-powered passport data extraction</li>
                  <li className="text-brand-800">Real-time pricing updates as you make selections</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <div className="text-center pt-4">
              <Button variant="brand" size="lg" onClick={handleStart} className="px-8">
                Start Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-600 mt-3">
                Your progress is automatically saved • No credit card required to start
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Trust Indicators */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Trusted by over 1,000+ businesses • Licensed by IFZA • Secure & Compliant</p>
        </div>
      </div>
    </div>
  )
}

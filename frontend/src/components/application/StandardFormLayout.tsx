'use client'

import { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PricingBanner } from '@/components/application/PricingBanner'

interface StandardFormLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  onBack?: () => void
  onContinue?: () => void
  backLabel?: string
  continueLabel?: string
  continueDisabled?: boolean
  errors?: string[]
  showPricing?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl'
}

export function StandardFormLayout({
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueDisabled = false,
  errors = [],
  showPricing = true,
  maxWidth = '7xl'
}: StandardFormLayoutProps) {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl'
  }[maxWidth]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className={`container mx-auto px-4 ${maxWidthClass}`}>
        {/* Standardized Header */}
        <div className="mb-8">
          <h1 className="font-lora text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className={`${showPricing ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            {children}
            
            {/* Error Display */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Navigation */}
            {(onBack || onContinue) && (
              <div className="flex justify-between pt-6">
                {onBack ? (
                  <Button variant="outline" onClick={onBack} className="px-6 py-3">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {backLabel}
                  </Button>
                ) : (
                  <div /> // Spacer
                )}
                
                {onContinue && (
                  <Button 
                    onClick={onContinue} 
                    disabled={continueDisabled}
                    className="px-6 py-3 bg-brand hover:bg-brand-600"
                  >
                    {continueLabel}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Pricing Sidebar */}
          {showPricing && (
            <div className="lg:col-span-1">
              <PricingBanner />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


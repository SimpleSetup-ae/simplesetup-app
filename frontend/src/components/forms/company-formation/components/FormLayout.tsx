'use client'

import { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Background } from '@/components/ui/background-dots-masked'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

interface FormLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
  showStepIndicator?: boolean;
  className?: string;
}

/**
 * High-level FormLayout that maintains the exact design language from existing form
 * Provides the signature backdrop, progress indicators, and navigation
 */
export function FormLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  nextLabel = "Next Step",
  backLabel = "Back",
  showStepIndicator = true,
  className = ''
}: FormLayoutProps) {
  const stepNumbers = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden ${className}`}>
      {/* Signature Dotted Background */}
      <Background />
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Header with Logo and Progress */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Link href="/" className="hover:scale-105 transition-all duration-300">
              <div className="border-2 border-foreground px-3 py-1 rounded-md">
                <Logo />
              </div>
            </Link>
          </div>
          
          {/* Signature Progress Indicator */}
          {showStepIndicator && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {stepNumbers.map((step) => (
                <div
                  key={step}
                  className={`w-6 h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-primary cursor-pointer hover:bg-primary/80' 
                      : 'bg-muted cursor-not-allowed'
                  } ${step <= currentStep ? 'hover:scale-110' : ''}`}
                  title={step <= currentStep ? `Step ${step}` : `Step ${step} - not available yet`}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Signature Form Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 md:p-12 shadow-xl">
          {children}
          
          {/* Navigation Buttons */}
          {(onNext || onBack) && (
            <div className="flex gap-4 mt-8">
              {onBack && (
                <Button
                  onClick={onBack}
                  disabled={!canGoBack}
                  variant="outline"
                  className="h-12 md:h-14 px-6 text-base md:text-lg font-semibold rounded-xl border-2 hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {backLabel}
                </Button>
              )}
              
              {onNext && (
                <Button
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="flex-1 h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  {nextLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
            <p className="text-sm text-muted-foreground">
              No markups, transparent pricing
            </p>
          </div>
          
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

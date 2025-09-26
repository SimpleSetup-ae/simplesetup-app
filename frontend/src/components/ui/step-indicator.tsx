import React from 'react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  step: number
  title: string
  description?: string
  isActive?: boolean
  isCompleted?: boolean
  className?: string
}

export function StepIndicator({
  step,
  title,
  description,
  isActive = false,
  isCompleted = false,
  className
}: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {/* Step Number */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200",
            {
              // Active state - Orange gradient with glow
              "brand-step-number shadow-lg shadow-brand-500/30": isActive,
              // Completed state - Green with checkmark
              "bg-success-500 text-white shadow-md": isCompleted,
              // Default state - Gray outline
              "border-2 border-gray-300 text-gray-500 bg-white": !isActive && !isCompleted,
            }
          )}
        >
          {isCompleted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            step
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "text-lg font-semibold transition-colors",
          {
            "text-brand-700": isActive,
            "text-success-700": isCompleted,
            "text-gray-700": !isActive && !isCompleted,
          }
        )}>
          {title}
        </h3>
        {description && (
          <p className={cn(
            "text-sm mt-1 transition-colors",
            {
              "text-brand-600": isActive,
              "text-success-600": isCompleted,
              "text-gray-500": !isActive && !isCompleted,
            }
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface StepProgressProps {
  steps: Array<{
    step: number
    title: string
    description?: string
  }>
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {steps.map((step, index) => (
        <div key={step.step} className="relative">
          {/* Connection line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "absolute left-6 top-12 w-0.5 h-16 transition-colors",
                {
                  "bg-success-300": index < currentStep - 1,
                  "bg-brand-200": index === currentStep - 1,
                  "bg-gray-200": index >= currentStep - 1,
                }
              )}
            />
          )}

          <StepIndicator
            step={step.step}
            title={step.title}
            description={step.description}
            isActive={step.step === currentStep}
            isCompleted={step.step < currentStep}
          />
        </div>
      ))}
    </div>
  )
}


'use client'

import { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Save, Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FormStep, FormState } from '../types/FormConfig'

interface FormWizardProps {
  steps: FormStep[];
  currentStep: string;
  formState: FormState;
  children: ReactNode;
  onStepChange: (stepId: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSave?: () => Promise<void>;
  canGoNext?: boolean;
  canGoBack?: boolean;
  showSaveButton?: boolean;
  className?: string;
}

export function FormWizard({
  steps,
  currentStep,
  formState,
  children,
  onStepChange,
  onNext,
  onBack,
  onSave,
  canGoNext = true,
  canGoBack = true,
  showSaveButton = false,
  className = ''
}: FormWizardProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepConfig = steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  
  // Check if a step can be navigated to (completed or current)
  const canNavigateToStep = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    return stepIndex <= currentStepIndex || formState.completedSteps.includes(stepId);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-primary/5 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Company Formation</h1>
              <p className="text-muted-foreground">IFZA Free Zone</p>
            </div>
            
            {/* Auto-save Status */}
            <div className="flex items-center gap-3">
              {formState.isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Saving...
                </div>
              )}
              
              {formState.lastSaved && !formState.isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Saved {formatTimeAgo(formState.lastSaved)}
                </div>
              )}
              
              {formState.hasUnsavedChanges && !formState.isSaving && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = formState.completedSteps.includes(step.id);
                const canNavigate = canNavigateToStep(step.id);
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 ${canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => canNavigate && onStepChange(step.id)}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-primary text-white shadow-lg' 
                        : isCompleted 
                          ? 'bg-green-500 text-white'
                          : canNavigate
                            ? 'bg-muted text-muted-foreground hover:bg-primary hover:text-white'
                            : 'bg-muted/50 text-muted-foreground/50'
                      }
                    `}>
                      {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              {currentStepConfig?.icon && (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">{getIconComponent(currentStepConfig.icon)}</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{currentStepConfig?.title}</h2>
                <p className="text-muted-foreground">{currentStepConfig?.subtitle}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep || !canGoBack || formState.isSaving}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            {showSaveButton && onSave && (
              <Button
                variant="outline"
                onClick={onSave}
                disabled={formState.isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Progress
              </Button>
            )}
            
            <Button
              onClick={onNext}
              disabled={!canGoNext || formState.isSaving}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Submit Application' : 'Next Step'}
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Validation Errors Summary */}
        {formState.validationErrors[currentStep]?.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Please fix the following issues:</h3>
            <ul className="space-y-1">
              {formState.validationErrors[currentStep].map((error, index) => (
                <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get icon components
function getIconComponent(iconName: string) {
  const iconMap: Record<string, string> = {
    briefcase: '💼',
    building: '🏢', 
    users: '👥',
    upload: '📄'
  };
  
  return iconMap[iconName] || '📋';
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
}

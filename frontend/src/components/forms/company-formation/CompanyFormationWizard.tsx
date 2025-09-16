'use client'

import { useState, useEffect, useCallback } from 'react'
import { FormLayout } from './components/FormLayout'
import { BusinessActivitiesStep } from './steps/BusinessActivitiesStep'
import { CompanyDetailsStep } from './steps/CompanyDetailsStep'
import { PeopleOwnershipStep } from './steps/PeopleOwnershipStep'
import { DocumentUploadStep } from './steps/DocumentUploadStep'
import { useFormState } from './hooks/useFormState'
import { useFormConfig } from './hooks/useFormConfig'
import { CompanyFormData, ValidationResult } from './types/FormConfig'

interface CompanyFormationWizardProps {
  companyId: string;
  freezone?: string;
}

/**
 * Main Form Orchestrator - maintains existing design language
 * Replaces the monolithic 564-line component with elegant abstractions
 */
export function CompanyFormationWizard({ 
  companyId, 
  freezone = 'IFZA' 
}: CompanyFormationWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepValidations, setStepValidations] = useState<Record<string, ValidationResult>>({});

  // Use our custom hooks
  const { config, isLoading: configLoading, validateCompanyName, validateShareCapital } = useFormConfig({ freezone });
  const { 
    formState, 
    formData, 
    updateStepData, 
    setCurrentStep,
    markStepCompleted,
    setValidationErrors,
    hasUnsavedChanges 
  } = useFormState({ companyId });

  // Define the steps (from config or fallback)
  const steps = config?.steps || [
    { id: 'business_activities', title: 'What does your company do?', subtitle: 'Choose your business activities', icon: 'briefcase', component: 'business_activities' },
    { id: 'company_details', title: 'Company details', subtitle: 'Name, structure, and visa needs', icon: 'building', component: 'company_setup' },
    { id: 'people_ownership', title: 'People & ownership', subtitle: 'Who\'s involved and who owns what', icon: 'users', component: 'people_management' },
    { id: 'documents', title: 'Upload documents', subtitle: 'Passport and supporting documents', icon: 'upload', component: 'document_upload' }
  ];

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Handle step validation
  const handleStepValidation = useCallback((stepId: string, result: ValidationResult) => {
    setStepValidations(prev => ({ ...prev, [stepId]: result }));
    setValidationErrors(stepId, result.errors);
    
    if (result.valid) {
      markStepCompleted(stepId);
    }
  }, [setValidationErrors, markStepCompleted]);

  // Navigation handlers
  const handleNext = () => {
    const currentValidation = stepValidations[currentStep.id];
    
    if (currentValidation?.valid) {
      if (isLastStep) {
        // Submit form
        handleSubmit();
      } else {
        setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
        setCurrentStep(steps[currentStepIndex + 1]?.id);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setCurrentStep(steps[currentStepIndex - 1]?.id);
    }
  };

  const handleSubmit = async () => {
    try {
      // Final validation and submission logic
      console.log('Submitting company formation:', formData);
      // TODO: Implement actual submission
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  // Update step data handler
  const handleStepDataChange = useCallback((stepId: string, data: any) => {
    updateStepData(stepId, data);
  }, [updateStepData]);

  // Check if we can proceed to next step
  const canGoNext = stepValidations[currentStep?.id]?.valid || false;
  const canGoBack = currentStepIndex > 0;

  if (configLoading || formState.isLoading) {
    return (
      <FormLayout
        currentStep={1}
        totalSteps={4}
        showStepIndicator={false}
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your company formation...</p>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      onNext={handleNext}
      onBack={handleBack}
      canGoNext={canGoNext}
      canGoBack={canGoBack}
      nextLabel={isLastStep ? "Submit Application" : "Next Step"}
    >
      {/* Render current step */}
      {currentStep?.id === 'business_activities' && (
        <BusinessActivitiesStep
          selectedActivities={formData.business_activities || []}
          mainActivityId={formData.main_activity_id || null}
          freezone={freezone}
          maxFreeActivities={config?.business_rules.activities.free_count || 3}
          onDataChange={(data) => handleStepDataChange('business_activities', data)}
          onValidationChange={(result) => handleStepValidation('business_activities', result)}
        />
      )}

      {currentStep?.id === 'company_details' && (
        <CompanyDetailsStep
          companyNames={formData.company_names || ['']}
          licenseYears={formData.license_years || 2}
          visaCount={formData.visa_count || 1}
          partnerVisaCount={formData.partner_visa_count || 0}
          shareCapital={formData.share_capital || 10000}
          onDataChange={(data) => handleStepDataChange('company_details', data)}
          onValidationChange={(result) => handleStepValidation('company_details', result)}
          validateCompanyName={validateCompanyName}
          validateShareCapital={validateShareCapital}
        />
      )}

      {currentStep?.id === 'people_ownership' && (
        <PeopleOwnershipStep
          shareholders={(formData.shareholders as any) || []}
          directors={(formData.directors as any) || []}
          shareCapital={formData.share_capital || 10000}
          shareValue={formData.share_value || 10}
          onDataChange={(data) => handleStepDataChange('people_ownership', data)}
          onValidationChange={(result) => handleStepValidation('people_ownership', result)}
        />
      )}

      {currentStep?.id === 'documents' && (
        <DocumentUploadStep
          uploadedFiles={formData.uploaded_files || []}
          requiredDocuments={['Passport copies for all individuals', 'Emirates ID (if applicable)', 'Corporate documents (if applicable)']}
          companyId={companyId}
          onFilesChange={(files) => handleStepDataChange('documents', { uploaded_files: files })}
          onValidationChange={(result) => handleStepValidation('documents', result)}
        />
      )}

      {/* Auto-save indicator */}
      {hasUnsavedChanges && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {formState.isSaving ? 'Saving changes...' : 'Changes saved automatically'}
          </p>
        </div>
      )}
    </FormLayout>
  );
}

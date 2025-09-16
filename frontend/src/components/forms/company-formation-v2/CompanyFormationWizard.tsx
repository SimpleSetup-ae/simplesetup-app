'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Building, Users, FileText, Briefcase, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFormState } from '../company-formation/hooks/useFormState'
import { useFormConfig } from '../company-formation/hooks/useFormConfig'
import { CompanyFormData, ValidationResult } from '../company-formation/types/FormConfig'
import { CompanyBasicsPage } from './pages/CompanyBasicsPage'
import { PeopleAndDocumentsPage } from './pages/PeopleAndDocumentsPage'
import { Background } from '@/components/ui/background-dots-masked'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

interface CompanyFormationWizardProps {
  companyId: string;
  freezone?: string;
}

/**
 * Redesigned Company Formation Wizard - 2 Pages, Beautiful UX
 * Orange/White brand theme with Shadcn components
 */
export function CompanyFormationWizard({ 
  companyId, 
  freezone = 'IFZA' 
}: CompanyFormationWizardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageValidations, setPageValidations] = useState<Record<string, ValidationResult>>({});

  // Use existing hooks
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

  // For demo purposes, bypass loading if it takes too long
  const [demoMode, setDemoMode] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (configLoading || formState.isLoading) {
        console.log('Switching to demo mode - loading taking too long');
        setDemoMode(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [configLoading, formState.isLoading]);

  // Define pages - consolidating 4 steps into 2 logical pages
  const pages = [
    {
      id: 'company_basics',
      title: 'Company Setup',
      subtitle: 'Business activities, company details, and structure',
      icon: Building,
      progress: 50
    },
    {
      id: 'people_documents', 
      title: 'People & Documents',
      subtitle: 'Ownership, shareholders, and required documents',
      icon: Users,
      progress: 100
    }
  ];

  const currentPageData = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;

  // Handle page validation
  const handlePageValidation = useCallback((pageId: string, result: ValidationResult) => {
    setPageValidations(prev => ({ ...prev, [pageId]: result }));
    setValidationErrors(pageId, result.errors);
    
    if (result.valid) {
      markStepCompleted(pageId);
    }
  }, [setValidationErrors, markStepCompleted]);

  // Navigation handlers
  const handleNext = () => {
    const currentValidation = pageValidations[currentPageData.id];
    
    if (currentValidation?.valid) {
      if (isLastPage) {
        handleSubmit();
      } else {
        setCurrentPage(prev => Math.min(prev + 1, pages.length - 1));
        setCurrentStep(pages[currentPage + 1]?.id);
      }
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setCurrentStep(pages[currentPage - 1]?.id);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting company formation:', formData);
      // TODO: Implement actual submission
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  // Check if we can proceed
  const canGoNext = pageValidations[currentPageData?.id]?.valid || false;
  const canGoBack = currentPage > 0;

  if ((configLoading || formState.isLoading) && !demoMode) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center p-4">
        <Background />
        <Card className="w-full max-w-md p-8 text-center gradient-card border-0 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your company formation...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-background flex items-center justify-center p-4 relative overflow-hidden">
      <Background />
      
      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:scale-105 transition-all duration-300 mb-6">
            <Logo />
          </Link>
          
          {/* Beautiful Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              {pages.map((page, index) => {
                const Icon = page.icon;
                const isActive = index === currentPage;
                const isCompleted = index < currentPage;
                
                return (
                  <div key={page.id} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                      ${isActive ? 'bg-primary border-primary text-white shadow-lg scale-110' : ''}
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-white border-muted-foreground/30 text-muted-foreground' : ''}
                    `}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    
                    {index < pages.length - 1 && (
                      <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                {currentPageData.title}
              </h1>
              <p className="text-muted-foreground">
                {currentPageData.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="gradient-card border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Render Current Page */}
            {currentPage === 0 && (
              <CompanyBasicsPage
                formData={formData}
                config={config}
                freezone={freezone}
                onDataChange={(data) => updateStepData('company_basics', data)}
                onValidationChange={(result) => handlePageValidation('company_basics', result)}
                validateCompanyName={validateCompanyName}
                validateShareCapital={validateShareCapital}
              />
            )}

            {currentPage === 1 && (
              <PeopleAndDocumentsPage
                formData={formData}
                companyId={companyId}
                onDataChange={(data) => updateStepData('people_documents', data)}
                onValidationChange={(result) => handlePageValidation('people_documents', result)}
              />
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-border/30">
              {canGoBack && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base font-semibold rounded-2xl border-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:border-primary/50 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                size="lg"
                className="flex-1 px-8 py-6 text-base font-semibold rounded-2xl gradient-button hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLastPage ? 'Submit Application' : 'Continue'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Auto-save indicator */}
            {hasUnsavedChanges && (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {formState.isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      Saving changes...
                    </span>
                  ) : (
                    'Changes saved automatically'
                  )}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Badge variant="secondary" className="bg-white/80 text-muted-foreground border-0">
              Page {currentPage + 1} of {pages.length}
            </Badge>
            <span>•</span>
            <span>No markups, transparent pricing</span>
            <span>•</span>
            <Link href="/" className="hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

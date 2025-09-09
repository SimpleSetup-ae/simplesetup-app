'use client'

import { useState, useEffect, useCallback } from 'react'
import { FormConfig, ValidationResult } from '../types/FormConfig'
import { mockFormConfig, mockValidateCompanyName, mockValidateShareCapital } from '@/lib/mockApi'

interface UseFormConfigOptions {
  freezone: string;
}

interface FormConfigHook {
  config: FormConfig | null;
  isLoading: boolean;
  error: string | null;
  validateCompanyName: (name: string) => Promise<ValidationResult>;
  validateActivities: (selectedActivities: number[], mainActivity: number) => Promise<ValidationResult>;
  validateVisaPackage: (visaCount: number, partnerVisaCount?: number) => Promise<ValidationResult>;
  validateShareCapital: (amount: number, partnerVisaCount?: number) => Promise<ValidationResult>;
  reloadConfig: () => Promise<void>;
}

export function useFormConfig({ freezone }: UseFormConfigOptions): FormConfigHook {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load form configuration (with mock fallback for testing)
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try real API first, fallback to mock for testing
      try {
        const response = await fetch(`/api/v1/form_configs/${freezone}`);
        const result = await response.json();
        
        if (response.ok && result.data) {
          setConfig(result.data);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data for testing');
      }
      
      // Fallback to mock data for testing
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setConfig(mockFormConfig);
      
    } catch (err) {
      setError('Failed to load form configuration');
      console.error('Form config load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [freezone]);

  // Validation methods (with mock fallback for testing)
  const validateCompanyName = useCallback(async (name: string): Promise<ValidationResult> => {
    try {
      const response = await fetch(`/api/v1/form_configs/${freezone}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'company_name',
          data: { name }
        })
      });
      
      const result = await response.json();
      return result.data || { valid: false, errors: ['Validation failed'] };
    } catch (error) {
      console.log('API not available, using mock validation');
      return mockValidateCompanyName(name);
    }
  }, [freezone]);

  const validateActivities = useCallback(async (
    selectedActivities: number[], 
    mainActivity: number
  ): Promise<ValidationResult> => {
    try {
      const response = await fetch(`/api/v1/form_configs/${freezone}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'activities',
          data: { 
            selected_activities: selectedActivities,
            main_activity: mainActivity
          }
        })
      });
      
      const result = await response.json();
      return result.data || { valid: false, errors: ['Validation failed'] };
    } catch (error) {
      console.error('Activities validation error:', error);
      return { valid: false, errors: ['Validation service unavailable'] };
    }
  }, [freezone]);

  const validateVisaPackage = useCallback(async (
    visaCount: number, 
    partnerVisaCount = 0
  ): Promise<ValidationResult> => {
    try {
      const response = await fetch(`/api/v1/form_configs/${freezone}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'visa_package',
          data: { 
            visa_count: visaCount,
            partner_visa_count: partnerVisaCount
          }
        })
      });
      
      const result = await response.json();
      return result.data || { valid: false, errors: ['Validation failed'] };
    } catch (error) {
      console.error('Visa package validation error:', error);
      return { valid: false, errors: ['Validation service unavailable'] };
    }
  }, [freezone]);

  const validateShareCapital = useCallback(async (
    amount: number, 
    partnerVisaCount = 0
  ): Promise<ValidationResult> => {
    try {
      const response = await fetch(`/api/v1/form_configs/${freezone}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'share_capital',
          data: { 
            amount,
            partner_visa_count: partnerVisaCount
          }
        })
      });
      
      const result = await response.json();
      return result.data || { valid: false, errors: ['Validation failed'] };
    } catch (error) {
      console.log('API not available, using mock validation');
      return mockValidateShareCapital(amount, partnerVisaCount);
    }
  }, [freezone]);

  // Reload configuration
  const reloadConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  // Load config on mount and when freezone changes
  useEffect(() => {
    if (freezone) {
      loadConfig();
    }
  }, [freezone, loadConfig]);

  return {
    config,
    isLoading,
    error,
    validateCompanyName,
    validateActivities,
    validateVisaPackage,
    validateShareCapital,
    reloadConfig
  };
}

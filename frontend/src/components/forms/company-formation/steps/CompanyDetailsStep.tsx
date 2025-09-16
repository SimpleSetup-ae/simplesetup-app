'use client'

import { useState, useEffect } from 'react'
import { Plus, Calculator, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormStep } from '../components/FormStep'
import { NumberStepper } from '../components/NumberStepper'
import { ValidationResult } from '../types/FormConfig'

interface CompanyDetailsStepProps {
  companyNames: string[];
  licenseYears: number;
  visaCount: number;
  partnerVisaCount: number;
  shareCapital: number;
  onDataChange: (data: any) => void;
  onValidationChange: (result: ValidationResult) => void;
  validateCompanyName: (name: string) => Promise<ValidationResult>;
  validateShareCapital: (amount: number, partnerVisaCount: number) => Promise<ValidationResult>;
}

export function CompanyDetailsStep({
  companyNames = [''],
  licenseYears = 2,
  visaCount = 1,
  partnerVisaCount = 0,
  shareCapital = 10000,
  onDataChange,
  onValidationChange,
  validateCompanyName,
  validateShareCapital
}: CompanyDetailsStepProps) {
  const [nameValidations, setNameValidations] = useState<Record<number, ValidationResult>>({});

  // Update company name
  const updateCompanyName = (index: number, value: string) => {
    const newNames = [...companyNames];
    newNames[index] = value;
    onDataChange({ company_names: newNames });
  };

  // Add company name
  const addCompanyName = () => {
    if (companyNames.length < 3) {
      onDataChange({ company_names: [...companyNames, ''] });
    }
  };

  // Validate names
  useEffect(() => {
    const validateNames = async () => {
      const validations: Record<number, ValidationResult> = {};
      
      for (let i = 0; i < companyNames.length; i++) {
        const name = companyNames[i];
        if (name.trim()) {
          validations[i] = await validateCompanyName(name);
        }
      }
      
      setNameValidations(validations);
      
      // Overall validation
      const allNamesValid = Object.values(validations).every(v => v.valid);
      const hasAtLeastOneName = companyNames.some(name => name.trim());
      
      onValidationChange({
        valid: allNamesValid && hasAtLeastOneName,
        errors: hasAtLeastOneName ? [] : ['At least one company name is required']
      });
    };

    validateNames();
  }, [companyNames, validateCompanyName, onValidationChange]);

  return (
    <FormStep 
      title="Tell us about your company"
      subtitle="Company names, license duration, and visa requirements"
    >
      <div className="space-y-8">
        {/* Company Names */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Company Names</h3>
            <p className="text-muted-foreground text-sm">
              Give us 1-3 name options. We'll check availability with IFZA.
            </p>
          </div>
          
          {companyNames.map((name, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => updateCompanyName(index, e.target.value)}
                  placeholder={`Company name option ${index + 1}...`}
                  className="flex-1 h-12 md:h-14 text-base md:text-lg rounded-xl border-2 focus:border-primary"
                />
                <div className="px-4 py-3 bg-muted rounded-xl border-2 border-border">
                  <span className="text-base md:text-lg font-medium text-muted-foreground">FZCO</span>
                </div>
              </div>
              
              {/* Validation feedback */}
              {nameValidations[index] && !nameValidations[index].valid && (
                <div className="space-y-1">
                  {nameValidations[index].errors.map((error, errorIndex) => (
                    <p key={errorIndex} className="text-sm text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {error}
                    </p>
                  ))}
                </div>
              )}
              
              {nameValidations[index]?.valid && (
                <p className="text-sm text-green-600 flex items-center">
                  <span className="w-1 h-1 bg-green-600 rounded-full mr-2"></span>
                  Company name is valid
                </p>
              )}
            </div>
          ))}
          
          {companyNames.length < 3 && (
            <Button
              variant="outline"
              onClick={addCompanyName}
              className="w-full h-12 border-dashed border-2 hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add another name option
            </Button>
          )}
        </div>

        {/* License Duration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">License Duration</h3>
            <p className="text-muted-foreground text-sm">
              How long do you need the trade license?
            </p>
          </div>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((years) => (
              <Button
                key={years}
                variant={licenseYears === years ? "default" : "outline"}
                onClick={() => onDataChange({ license_years: years })}
                className="flex-1 h-12 text-base font-semibold rounded-xl"
              >
                {years} Year{years > 1 ? 's' : ''}
              </Button>
            ))}
          </div>
        </div>

        {/* Visa Package */}
        <div className="space-y-6">
          <NumberStepper
            value={visaCount}
            onChange={(count) => {
              const newPartnerCount = Math.min(partnerVisaCount, count - 1);
              onDataChange({ 
                visa_count: count,
                partner_visa_count: newPartnerCount
              });
            }}
            min={1}
            max={9}
            label="How many people need visas?"
            singularUnit="visa"
            description="This includes you and any employees"
          />
          
          {visaCount > 1 && (
            <NumberStepper
              value={partnerVisaCount}
              onChange={(count) => onDataChange({ partner_visa_count: count })}
              min={0}
              max={Math.min(5, visaCount - 1)}
              label="Partner visas needed?"
              singularUnit="partner visa"
              description="Partner visas have special capital requirements"
            />
          )}
        </div>

        {/* Share Capital */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Share Capital</h3>
            <p className="text-muted-foreground text-sm">
              Initial investment amount for your company
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={shareCapital}
              onChange={(e) => onDataChange({ share_capital: Number(e.target.value) })}
              placeholder="10000"
              min="1000"
              step="1000"
              className="flex-1 h-12 md:h-14 text-base md:text-lg rounded-xl border-2 focus:border-primary text-right"
            />
            <div className="px-4 py-3 bg-muted rounded-xl border-2 border-border">
              <span className="text-base md:text-lg font-medium text-muted-foreground">AED</span>
            </div>
          </div>
          
          {/* Capital requirements info */}
          {partnerVisaCount > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">
                  {partnerVisaCount} partner visa{partnerVisaCount > 1 ? 's' : ''} require{partnerVisaCount === 1 ? 's' : ''} minimum {(partnerVisaCount * 48000).toLocaleString()} AED
                </span>
              </div>
            </div>
          )}
          
          {shareCapital > 150000 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">
                  Bank letter required for capital over 150,000 AED
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormStep>
  );
}

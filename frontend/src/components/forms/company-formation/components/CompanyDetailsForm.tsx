'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Minus, Calculator, AlertCircle, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { ValidationResult } from '../types/FormConfig'

interface CompanyDetailsFormProps {
  companyNames: string[];
  licenseYears: number;
  visaCount: number;
  partnerVisaCount: number;
  shareCapital: number;
  shareValue: number;
  establishmentCard: boolean;
  onDataChange: (data: any) => void;
  onValidationChange: (result: ValidationResult) => void;
  validateCompanyName: (name: string) => Promise<ValidationResult>;
  validateShareCapital: (amount: number, partnerVisaCount: number) => Promise<ValidationResult>;
  className?: string;
}

export function CompanyDetailsForm({
  companyNames = [''],
  licenseYears = 2,
  visaCount = 1,
  partnerVisaCount = 0,
  shareCapital = 10000,
  shareValue = 10,
  establishmentCard = true,
  onDataChange,
  onValidationChange,
  validateCompanyName,
  validateShareCapital,
  className = ''
}: CompanyDetailsFormProps) {
  const [nameValidations, setNameValidations] = useState<Record<number, ValidationResult>>({});
  const [capitalValidation, setCapitalValidation] = useState<ValidationResult>({ valid: true, errors: [] });
  const [isValidating, setIsValidating] = useState(false);

  // Calculate derived values
  const totalShares = Math.floor(shareCapital / shareValue);
  const isValidShareCalculation = shareCapital % shareValue === 0;
  const requiresBankLetter = shareCapital > 150000;
  const minCapitalForPartnerVisas = partnerVisaCount * 48000;

  // Validate company names
  const validateNames = useCallback(async () => {
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
    
    return {
      valid: allNamesValid && hasAtLeastOneName,
      errors: hasAtLeastOneName ? [] : ['At least one company name is required']
    };
  }, [companyNames, validateCompanyName]);

  // Validate share capital
  const validateCapital = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateShareCapital(shareCapital, partnerVisaCount);
      setCapitalValidation(result);
      return result;
    } catch (error) {
      const errorResult = { valid: false, errors: ['Validation failed'] };
      setCapitalValidation(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [shareCapital, partnerVisaCount, validateShareCapital]);

  // Update company names
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

  // Remove company name
  const removeCompanyName = (index: number) => {
    if (companyNames.length > 1) {
      const newNames = companyNames.filter((_, i) => i !== index);
      onDataChange({ company_names: newNames });
    }
  };

  // Update license years
  const updateLicenseYears = (years: number) => {
    onDataChange({ license_years: years });
  };

  // Update visa counts
  const updateVisaCount = (count: number) => {
    const newPartnerCount = Math.min(partnerVisaCount, count - 1);
    onDataChange({ 
      visa_count: count,
      partner_visa_count: newPartnerCount,
      establishment_card: count > 0
    });
  };

  const updatePartnerVisaCount = (count: number) => {
    onDataChange({ partner_visa_count: count });
  };

  // Update share capital
  const updateShareCapital = (amount: number) => {
    onDataChange({ share_capital: amount });
  };

  const updateShareValue = (value: number) => {
    onDataChange({ share_value: Math.max(10, value) });
  };

  // Validate on data changes
  useEffect(() => {
    const validate = async () => {
      const [namesResult, capitalResult] = await Promise.all([
        validateNames(),
        validateCapital()
      ]);
      
      const overallValid = namesResult.valid && capitalResult.valid && isValidShareCalculation;
      const allErrors = [...namesResult.errors, ...capitalResult.errors];
      
      if (!isValidShareCalculation) {
        allErrors.push('Share capital must be divisible by share value');
      }
      
      onValidationChange({
        valid: overallValid,
        errors: allErrors,
        requires_bank_letter: requiresBankLetter
      });
    };
    
    validate();
  }, [companyNames, shareCapital, shareValue, partnerVisaCount, validateNames, validateCapital, isValidShareCalculation, onValidationChange, requiresBankLetter]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Company Names Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Company Names</h3>
            <p className="text-muted-foreground text-sm">
              Provide 1-3 company name options. We'll check availability with IFZA.
            </p>
          </div>
          
          {companyNames.map((name, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor={`name-${index}`} className="text-sm font-medium">
                    Option {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`name-${index}`}
                      value={name}
                      onChange={(e) => updateCompanyName(index, e.target.value)}
                      placeholder="Enter company name..."
                      className="flex-1"
                    />
                    <div className="px-3 py-2 bg-muted rounded-md border">
                      <span className="text-sm font-medium text-muted-foreground">FZCO</span>
                    </div>
                  </div>
                </div>
                
                {companyNames.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompanyName(index)}
                    className="text-red-500 hover:text-red-700 mt-6"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              {/* Name validation feedback */}
              {nameValidations[index] && (
                <div className="ml-1">
                  {nameValidations[index].valid ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Name is available
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {nameValidations[index].errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {companyNames.length < 3 && (
            <Button
              variant="outline"
              onClick={addCompanyName}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add another name option
            </Button>
          )}
        </div>
      </Card>

      {/* License Duration */}
      <Card className="p-6">
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
                onClick={() => updateLicenseYears(years)}
                className="flex-1"
              >
                {years} Year{years > 1 ? 's' : ''}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Visa Package */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Visa Package</h3>
            <p className="text-muted-foreground text-sm">
              How many people need UAE residence visas?
            </p>
          </div>
          
          {/* Total Visas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Total Visas Needed</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateVisaCount(Math.max(1, visaCount - 1))}
                disabled={visaCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[100px] justify-center">
                <span className="text-2xl font-bold">{visaCount}</span>
                <span className="text-muted-foreground">visa{visaCount > 1 ? 's' : ''}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateVisaCount(Math.min(9, visaCount + 1))}
                disabled={visaCount >= 9}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Partner Visas */}
          {visaCount > 1 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Partner Visas (Special Requirements)</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePartnerVisaCount(Math.max(0, partnerVisaCount - 1))}
                  disabled={partnerVisaCount <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 min-w-[100px] justify-center">
                  <span className="text-xl font-semibold">{partnerVisaCount}</span>
                  <span className="text-muted-foreground text-sm">partner{partnerVisaCount > 1 ? 's' : ''}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePartnerVisaCount(Math.min(visaCount - 1, partnerVisaCount + 1))}
                  disabled={partnerVisaCount >= visaCount - 1}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {partnerVisaCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Partner visas require minimum {(partnerVisaCount * 48000).toLocaleString()} AED share capital
                </p>
              )}
            </div>
          )}
          
          {/* Establishment Card */}
          {visaCount > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Establishment Card included</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Required when visa package is selected
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Share Capital */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Share Capital Structure</h3>
            <p className="text-muted-foreground text-sm">
              Define your company's share capital and structure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Share Capital Amount */}
            <div className="space-y-2">
              <Label htmlFor="share-capital" className="text-sm font-medium">
                Share Capital (AED) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="share-capital"
                type="number"
                value={shareCapital}
                onChange={(e) => updateShareCapital(Number(e.target.value))}
                min="1000"
                step="1000"
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 1,000 AED
              </p>
            </div>
            
            {/* Share Value */}
            <div className="space-y-2">
              <Label htmlFor="share-value" className="text-sm font-medium">
                Value per Share (AED) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="share-value"
                type="number"
                value={shareValue}
                onChange={(e) => updateShareValue(Number(e.target.value))}
                min="10"
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 AED per share
              </p>
            </div>
          </div>
          
          {/* Calculation Display */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Share Calculation</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Shares:</span>
                <span className="ml-2 font-medium">{totalShares.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Share Capital:</span>
                <span className="ml-2 font-medium">{shareCapital.toLocaleString()} AED</span>
              </div>
            </div>
            
            {!isValidShareCalculation && (
              <Alert className="mt-3 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div className="text-orange-800 text-sm">
                  Share capital must be evenly divisible by share value
                </div>
              </Alert>
            )}
          </Card>
          
          {/* Capital Requirements */}
          {partnerVisaCount > 0 && (
            <Alert className={shareCapital >= minCapitalForPartnerVisas ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className={shareCapital >= minCapitalForPartnerVisas ? "text-green-800" : "text-red-800"}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {shareCapital >= minCapitalForPartnerVisas ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  Partner Visa Capital Requirement
                </div>
                <p className="text-sm mt-1">
                  {partnerVisaCount} partner visa{partnerVisaCount > 1 ? 's' : ''} require{partnerVisaCount === 1 ? 's' : ''} minimum {minCapitalForPartnerVisas.toLocaleString()} AED
                  {shareCapital < minCapitalForPartnerVisas && (
                    <span className="block mt-1">
                      Current: {shareCapital.toLocaleString()} AED (Short by {(minCapitalForPartnerVisas - shareCapital).toLocaleString()} AED)
                    </span>
                  )}
                </p>
              </div>
            </Alert>
          )}
          
          {/* Bank Letter Requirement */}
          {requiresBankLetter && (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="text-blue-800">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Bank Letter Required
                </div>
                <p className="text-sm mt-1">
                  Share capital over 150,000 AED requires a bank letter confirmation
                </p>
              </div>
            </Alert>
          )}
          
          {/* Capital Validation Errors */}
          {!capitalValidation.valid && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="text-red-800">
                {capitalValidation.errors.map((error, index) => (
                  <p key={index} className="text-sm">{error}</p>
                ))}
              </div>
            </Alert>
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h4 className="font-medium mb-3">Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">License Duration:</span>
            <span className="ml-2 font-medium">{licenseYears} year{licenseYears > 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Visa Package:</span>
            <span className="ml-2 font-medium">{visaCount} visa{visaCount > 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Partner Visas:</span>
            <span className="ml-2 font-medium">{partnerVisaCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Share Capital:</span>
            <span className="ml-2 font-medium">{shareCapital.toLocaleString()} AED</span>
          </div>
        </div>
        
        {requiresBankLetter && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Bank Letter Required
            </Badge>
          </div>
        )}
      </Card>
    </div>
  );
}

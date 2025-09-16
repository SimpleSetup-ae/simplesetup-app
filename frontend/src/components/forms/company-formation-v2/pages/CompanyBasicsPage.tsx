'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Calculator, AlertCircle, Building, Briefcase, Star, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CompanyFormData, ValidationResult, BusinessActivity, SelectedActivity } from '../../company-formation/types/FormConfig'
import { businessActivities, searchBusinessActivities } from '@/lib/businessActivitiesData'
import Link from 'next/link'

interface CompanyBasicsPageProps {
  formData: CompanyFormData;
  config: any;
  freezone: string;
  onDataChange: (data: any) => void;
  onValidationChange: (result: ValidationResult) => void;
  validateCompanyName: (name: string) => Promise<ValidationResult>;
  validateShareCapital: (amount: number, partnerVisaCount: number) => Promise<ValidationResult>;
}

export function CompanyBasicsPage({
  formData,
  config,
  freezone,
  onDataChange,
  onValidationChange,
  validateCompanyName,
  validateShareCapital
}: CompanyBasicsPageProps) {
  const [availableActivities, setAvailableActivities] = useState<BusinessActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [nameValidations, setNameValidations] = useState<Record<number, ValidationResult>>({});

  const selectedActivities = formData.business_activities || [];
  const companyNames = formData.company_names || [''];
  const licenseYears = formData.license_years || 2;
  const visaCount = formData.visa_count || 1;
  const partnerVisaCount = formData.partner_visa_count || 0;
  const shareCapital = formData.share_capital || 10000;
  const maxFreeActivities = config?.business_rules?.activities?.free_count || 3;
  const additionalActivityFee = 1000; // AED per additional activity
  
  // Get similar activities based on activity codes (first 3 digits)
  const getSimilarActivities = (selectedActivity: BusinessActivity): BusinessActivity[] => {
    const codePrefix = selectedActivity.activity_code.substring(0, 3);
    return availableActivities.filter(activity => 
      activity.activity_code.startsWith(codePrefix) && 
      activity.id !== selectedActivity.id &&
      !selectedActivities.some(selected => selected.id === activity.id)
    ).slice(0, 3);
  };
  
  const remainingFreeSlots = Math.max(0, maxFreeActivities - selectedActivities.length);
  const paidActivities = Math.max(0, selectedActivities.length - maxFreeActivities);
  const totalAdditionalCost = paidActivities * additionalActivityFee;

  // Load business activities
  useEffect(() => {
    const loadActivities = async () => {
      try {
        // For demo purposes, use mock data with a short delay
        console.log('Loading real business activities from database');
        await new Promise(resolve => setTimeout(resolve, 800));
        setAvailableActivities(businessActivities);
        
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadActivities();
  }, [freezone]);

  // Filter activities based on search
  const filteredActivities = searchBusinessActivities(searchQuery, availableActivities);

  // Handle activity selection
  const handleActivityToggle = (activity: BusinessActivity) => {
    const isSelected = selectedActivities.some(selected => selected.id === activity.id);
    
    let newSelectedActivities: SelectedActivity[];
    
    if (isSelected) {
      newSelectedActivities = selectedActivities.filter(selected => selected.id !== activity.id);
    } else {
      const newActivity: SelectedActivity = {
        id: activity.id,
        activity_code: activity.activity_code,
        activity_name: activity.activity_name,
        is_main: selectedActivities.length === 0, // First one is main
        is_free: selectedActivities.length < maxFreeActivities
      };
      newSelectedActivities = [...selectedActivities, newActivity];
    }
    
    // Update main activity if needed
    const mainActivity = newSelectedActivities.find(a => a.is_main);
    const mainActivityId = mainActivity?.id || newSelectedActivities[0]?.id || null;
    
    onDataChange({
      business_activities: newSelectedActivities,
      main_activity_id: mainActivityId
    });
  };

  // Handle setting main activity
  const handleSetMainActivity = (activityId: number) => {
    const updatedActivities = selectedActivities.map(activity => ({
      ...activity,
      is_main: activity.id === activityId
    }));
    
    onDataChange({
      business_activities: updatedActivities,
      main_activity_id: activityId
    });
  };

  // Handle company name changes
  const updateCompanyName = (index: number, value: string) => {
    const newNames = [...companyNames];
    newNames[index] = value;
    onDataChange({ company_names: newNames });
  };

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
    };

    validateNames();
  }, [companyNames, validateCompanyName]);

  // Overall page validation
  useEffect(() => {
    const errors: string[] = [];
    
    // Business activities validation
    if (selectedActivities.length === 0) {
      errors.push('Please select at least one business activity');
    }
    
    // Company names validation
    const hasValidName = companyNames.some(name => name.trim());
    if (!hasValidName) {
      errors.push('Please provide at least one company name');
    }
    
    const nameErrors = Object.values(nameValidations).some(v => !v.valid);
    if (nameErrors) {
      errors.push('Please fix company name errors');
    }
    
    onValidationChange({
      valid: errors.length === 0,
      errors
    });
  }, [selectedActivities.length, companyNames, nameValidations, onValidationChange]);

  return (
    <div className="space-y-8">
      {/* Business Activities Section */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Business Activities</h2>
          </div>
          <p className="text-muted-foreground mb-2">
            Select up to {maxFreeActivities} activities for free, then {additionalActivityFee} AED each for additional ones.
          </p>
          {remainingFreeSlots > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              {remainingFreeSlots} free slot{remainingFreeSlots !== 1 ? 's' : ''} remaining
            </div>
          )}
          <div className="mt-3">
            <Link 
              href="/business-activities" 
              target="_blank"
              className="text-primary hover:text-primary/80 text-sm underline"
            >
              View all available business activities →
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type what your business does..."
            className="pl-10 h-12 text-base rounded-2xl border-2 focus:border-primary/50 bg-white/50"
          />
        </div>

        {/* Selected Activities */}
        {selectedActivities.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-800">Selected Activities ({selectedActivities.length})</h3>
              <div className="flex gap-2">
                <Badge className="bg-green-600 hover:bg-green-700">
                  {Math.min(selectedActivities.length, maxFreeActivities)} Free
                </Badge>
                {selectedActivities.length > maxFreeActivities && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {selectedActivities.length - maxFreeActivities} Paid
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              {selectedActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    {activity.is_main && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <span className="font-medium">{activity.activity_name}</span>
                    <Badge variant="outline" className="text-xs">{activity.activity_code}</Badge>
                  </div>
                  {!activity.is_main && selectedActivities.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetMainActivity(activity.id)}
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Set as Main
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Available Activities */}
        {isLoadingActivities ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading activities...</p>
          </div>
        ) : (
          <div className="grid gap-3 max-h-64 overflow-y-auto">
            {filteredActivities.slice(0, 10).map((activity) => {
              const isSelected = selectedActivities.some(selected => selected.id === activity.id);
              
              return (
                <Card
                  key={activity.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/30 shadow-sm' 
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleActivityToggle(activity)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{activity.activity_name}</span>
                        <Badge variant="outline" className="text-xs">{activity.activity_code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.activity_description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border/30 pt-8">
        {/* Company Details Section */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Company Details</h2>
            </div>
            <p className="text-muted-foreground">
              Company names, license duration, and structure
            </p>
          </div>

          {/* Company Names */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Company Names (1-3 options)</Label>
            
            {companyNames.map((name, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => updateCompanyName(index, e.target.value)}
                    placeholder={`Company name option ${index + 1}...`}
                    className="flex-1 h-12 text-base rounded-2xl border-2 focus:border-primary/50 bg-white/50"
                  />
                  <div className="px-4 py-3 bg-muted/50 rounded-2xl border-2 border-border">
                    <span className="text-base font-medium text-muted-foreground">FZCO</span>
                  </div>
                </div>
                
                {nameValidations[index] && !nameValidations[index].valid && (
                  <div className="space-y-1">
                    {nameValidations[index].errors.map((error, errorIndex) => (
                      <p key={errorIndex} className="text-sm text-red-500 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
                
                {nameValidations[index]?.valid && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Name is available
                  </p>
                )}
              </div>
            ))}
            
            {companyNames.length < 3 && (
              <Button
                variant="outline"
                onClick={addCompanyName}
                className="w-full h-12 border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 rounded-2xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another name option
              </Button>
            )}
          </div>

          {/* Quick Setup Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* License Duration */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                License Duration
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 5].map((years) => (
                  <Button
                    key={years}
                    variant={licenseYears === years ? "default" : "outline"}
                    onClick={() => onDataChange({ license_years: years })}
                    className="h-10 text-sm font-semibold rounded-xl"
                  >
                    {years} Year{years > 1 ? 's' : ''}
                  </Button>
                ))}
              </div>
            </div>

            {/* Visa Count */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Total Visas</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDataChange({ visa_count: Math.max(1, visaCount - 1) })}
                  className="h-10 w-10 rounded-xl"
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={visaCount}
                  onChange={(e) => onDataChange({ visa_count: Math.max(1, Number(e.target.value)) })}
                  className="h-10 text-center rounded-xl border-2"
                  min="1"
                  max="9"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDataChange({ visa_count: Math.min(9, visaCount + 1) })}
                  className="h-10 w-10 rounded-xl"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Share Capital */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Share Capital</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={shareCapital}
                  onChange={(e) => onDataChange({ share_capital: Number(e.target.value) })}
                  placeholder="10000"
                  min="1000"
                  step="1000"
                  className="h-10 text-right rounded-xl border-2"
                />
                <div className="px-3 py-2 bg-muted/50 rounded-xl border-2 border-border">
                  <span className="text-sm font-medium text-muted-foreground">AED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Visas */}
          {visaCount > 1 && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <Label className="text-base font-semibold text-blue-900 mb-3 block">
                Partner Visas (Optional)
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDataChange({ partner_visa_count: Math.max(0, partnerVisaCount - 1) })}
                    className="h-10 w-10 rounded-xl border-blue-300"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={partnerVisaCount}
                    onChange={(e) => onDataChange({ partner_visa_count: Math.max(0, Math.min(visaCount - 1, Number(e.target.value))) })}
                    className="h-10 w-16 text-center rounded-xl border-2 border-blue-300"
                    min="0"
                    max={visaCount - 1}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDataChange({ partner_visa_count: Math.min(visaCount - 1, partnerVisaCount + 1) })}
                    className="h-10 w-10 rounded-xl border-blue-300"
                  >
                    +
                  </Button>
                </div>
                
                {partnerVisaCount > 0 && (
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">
                      Requires minimum {(partnerVisaCount * 48000).toLocaleString()} AED capital
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Capital Requirements Info */}
          {shareCapital > 150000 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
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
    </div>
  );
}

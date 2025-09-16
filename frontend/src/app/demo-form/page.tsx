'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Building, Users, Check, Search, Plus, Calculator, AlertCircle, Briefcase, Star, Clock, Upload, Trash2, User, Building2, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Background } from '@/components/ui/background-dots-masked'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

interface BusinessActivity {
  id: number;
  activity_code: string;
  activity_name: string;
  activity_description: string;
  activity_type: string;
}

interface SelectedActivity {
  id: number;
  activity_code: string;
  activity_name: string;
  is_main: boolean;
  is_free: boolean;
}

interface Person {
  id: string;
  type: 'individual' | 'corporate';
  name: string;
  nationality?: string;
  passport_number?: string;
  company_name?: string;
  company_jurisdiction?: string;
  shareholding_percentage: number;
  is_director: boolean;
  uploaded_documents: string[];
}

export default function DemoFormPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableActivities, setAvailableActivities] = useState<BusinessActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  
  // Form data
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
  const [companyNames, setCompanyNames] = useState<string[]>(['']);
  const [licenseYears, setLicenseYears] = useState(2);
  const [visaCount, setVisaCount] = useState(1);
  const [partnerVisaCount, setPartnerVisaCount] = useState(0);
  const [shareCapital, setShareCapital] = useState(10000);
  const [people, setPeople] = useState<Person[]>([{
    id: '1',
    type: 'individual',
    name: '',
    nationality: '',
    passport_number: '',
    shareholding_percentage: 100,
    is_director: true,
    uploaded_documents: []
  }]);

  const maxFreeActivities = 3;
  const additionalActivityFee = 1000; // AED per additional activity
  const totalShareholding = people.reduce((sum, person) => sum + person.shareholding_percentage, 0);
  
  // Load business activities from API
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await fetch('/api/business-activities?per_page=1000');
        const result = await response.json();
        
        if (result.data) {
          setAvailableActivities(result.data.map((activity: any, index: number) => ({
            id: index + 1,
            activity_code: activity.activity_code,
            activity_name: activity.activity_name,
            activity_description: activity.activity_description,
            activity_type: activity.activity_type
          })));
        }
      } catch (error) {
        console.error('Failed to load business activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadActivities();
  }, []);

  // Get similar activities based on activity codes (first 3 digits)
  const getSimilarActivitiesFiltered = (selectedActivity: BusinessActivity): BusinessActivity[] => {
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

  // Pages configuration
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

  // Filter activities based on search
  const filteredActivities = availableActivities.filter(activity =>
    activity.activity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.activity_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.activity_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        is_main: selectedActivities.length === 0,
        is_free: selectedActivities.length < maxFreeActivities
      };
      newSelectedActivities = [...selectedActivities, newActivity];
    }
    
    setSelectedActivities(newSelectedActivities);
  };

  // Handle setting main activity
  const handleSetMainActivity = (activityId: number) => {
    const updatedActivities = selectedActivities.map(activity => ({
      ...activity,
      is_main: activity.id === activityId
    }));
    setSelectedActivities(updatedActivities);
  };

  // Handle company name changes
  const updateCompanyName = (index: number, value: string) => {
    const newNames = [...companyNames];
    newNames[index] = value;
    setCompanyNames(newNames);
  };

  const addCompanyName = () => {
    if (companyNames.length < 3) {
      setCompanyNames([...companyNames, '']);
    }
  };

  // Add person
  const addPerson = (type: 'individual' | 'corporate') => {
    const remainingShares = 100 - totalShareholding;
    const newPerson: Person = {
      id: Date.now().toString(),
      type,
      name: '',
      nationality: type === 'individual' ? '' : undefined,
      passport_number: type === 'individual' ? '' : undefined,
      company_name: type === 'corporate' ? '' : undefined,
      company_jurisdiction: type === 'corporate' ? '' : undefined,
      shareholding_percentage: Math.min(remainingShares, 10),
      is_director: false,
      uploaded_documents: []
    };
    
    setPeople([...people, newPerson]);
  };

  // Update person
  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(people.map(person => 
      person.id === id ? { ...person, ...updates } : person
    ));
  };

  // Remove person
  const removePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
  };

  // Navigation
  const canGoNext = currentPage === 0 
    ? selectedActivities.length > 0 && companyNames.some(name => name.trim())
    : Math.abs(totalShareholding - 100) < 0.01 && people.some(p => p.is_director) && people.every(p => p.name.trim());

  const handleNext = () => {
    if (canGoNext) {
      if (isLastPage) {
        alert('Form submitted successfully! (This is a demo)');
      } else {
        setCurrentPage(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

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
            
            {/* Page 1: Company Basics */}
            {currentPage === 0 && (
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
                        <h3 className="font-semibold text-green-800">Selected Activities ({selectedActivities.length}/{maxFreeActivities} free)</h3>
                        <div className="flex gap-2">
                          <Badge className="bg-green-600 hover:bg-green-700">
                            {Math.min(selectedActivities.length, maxFreeActivities)} Free
                          </Badge>
                          {paidActivities > 0 && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              {paidActivities} × {additionalActivityFee} AED
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {remainingFreeSlots > 0 && (
                        <div className="mb-3 p-2 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            💡 Add {remainingFreeSlots} more activit{remainingFreeSlots !== 1 ? 'ies' : 'y'} for free to maximize your license value!
                          </p>
                        </div>
                      )}
                      
                      {totalAdditionalCost > 0 && (
                        <div className="mb-3 p-2 bg-orange-100 rounded-lg">
                          <p className="text-sm text-orange-800 font-medium">
                            Additional cost: {totalAdditionalCost.toLocaleString()} AED
                          </p>
                        </div>
                      )}
                      
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

                  {/* Suggested Similar Activities */}
                  {selectedActivities.length > 0 && remainingFreeSlots > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-muted-foreground">Suggested Similar Activities</h3>
                      <div className="grid gap-2">
                        {selectedActivities.slice(-1).map(lastSelected => {
                          const lastActivity = availableActivities.find(a => a.id === lastSelected.id);
                          if (!lastActivity) return null;
                          
                          const suggestions = getSimilarActivitiesFiltered(lastActivity);
                          return suggestions.map(activity => (
                            <Card
                              key={`suggestion-${activity.id}`}
                              className="p-3 cursor-pointer transition-all duration-200 hover:shadow-md border-dashed border-primary/30 hover:bg-primary/5"
                              onClick={() => handleActivityToggle(activity)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded border-2 border-primary/50 flex items-center justify-center">
                                  <Plus className="h-3 w-3 text-primary/70" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{activity.activity_name}</span>
                                    <Badge variant="outline" className="text-xs">{activity.activity_code}</Badge>
                                    <Badge className="bg-green-600 text-xs">Free</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {activity.activity_description}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ));
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Activities */}
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
                        <div key={index} className="flex items-center gap-2">
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
                              onClick={() => setLicenseYears(years)}
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
                            onClick={() => setVisaCount(Math.max(1, visaCount - 1))}
                            className="h-10 w-10 rounded-xl"
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={visaCount}
                            onChange={(e) => setVisaCount(Math.max(1, Number(e.target.value)))}
                            className="h-10 text-center rounded-xl border-2"
                            min="1"
                            max="9"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVisaCount(Math.min(9, visaCount + 1))}
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
                            onChange={(e) => setShareCapital(Number(e.target.value))}
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
                  </div>
                </div>
              </div>
            )}

            {/* Page 2: People & Documents */}
            {currentPage === 1 && (
              <div className="space-y-8">
                {/* People & Ownership Section */}
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-semibold">People & Ownership</h2>
                    </div>
                    <p className="text-muted-foreground">
                      Who owns the company and who will be directors?
                    </p>
                  </div>

                  {/* Shareholding Summary */}
                  <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-900">Shareholding Summary</h3>
                      <Badge className={`${
                        Math.abs(totalShareholding - 100) < 0.01 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}>
                        {totalShareholding.toFixed(1)}% / 100%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-lg text-blue-900">{(shareCapital / 10).toLocaleString()}</div>
                        <div className="text-blue-700">Total Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-blue-900">10 AED</div>
                        <div className="text-blue-700">Per Share</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-blue-900">{shareCapital.toLocaleString()} AED</div>
                        <div className="text-blue-700">Share Capital</div>
                      </div>
                    </div>
                  </Card>

                  {/* People List */}
                  <div className="space-y-4">
                    {people.map((person, index) => (
                      <Card key={person.id} className="p-6 bg-gradient-card border-0 shadow-md">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {person.type === 'individual' ? (
                                <User className="h-4 w-4 text-primary" />
                              ) : (
                                <Building2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {person.type === 'individual' ? 'Individual' : 'Corporate'} Shareholder {index + 1}
                              </h4>
                              {person.is_director && (
                                <Badge variant="secondary" className="text-xs mt-1">Director</Badge>
                              )}
                            </div>
                          </div>
                          
                          {people.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePerson(person.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          {/* Name Fields */}
                          <div>
                            <Label className="text-sm font-medium">
                              {person.type === 'individual' ? 'Full Name' : 'Company Name'}
                            </Label>
                            <Input
                              value={person.name}
                              onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                              placeholder={person.type === 'individual' ? 'Enter full name' : 'Company name'}
                              className="mt-1 h-10 rounded-xl border-2"
                            />
                          </div>
                          
                          {person.type === 'individual' && (
                            <div>
                              <Label className="text-sm font-medium">Nationality</Label>
                              <Input
                                value={person.nationality || ''}
                                onChange={(e) => updatePerson(person.id, { nationality: e.target.value })}
                                placeholder="e.g., British, Indian"
                                className="mt-1 h-10 rounded-xl border-2"
                              />
                            </div>
                          )}

                          {/* Shareholding */}
                          <div>
                            <Label className="text-sm font-medium flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              Shareholding %
                            </Label>
                            <Input
                              type="number"
                              value={person.shareholding_percentage}
                              onChange={(e) => updatePerson(person.id, { shareholding_percentage: Number(e.target.value) })}
                              min="0"
                              max="100"
                              step="0.1"
                              className="mt-1 h-10 rounded-xl border-2"
                            />
                          </div>
                        </div>

                        {/* Director Checkbox */}
                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            id={`director-${person.id}`}
                            checked={person.is_director}
                            onChange={(e) => updatePerson(person.id, { is_director: e.target.checked })}
                            className="w-4 h-4 text-primary border-2 border-border rounded focus:ring-primary"
                          />
                          <Label htmlFor={`director-${person.id}`} className="text-sm font-medium">
                            This person will be a Director
                          </Label>
                        </div>

                        {/* Document Upload Placeholder */}
                        <div className="border-t border-border/30 pt-4">
                          <Label className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            Required Documents
                          </Label>
                          
                          <div className="p-3 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground text-center">
                              Upload {person.type === 'individual' ? 'passport & ID' : 'corporate documents'} here
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Add Person Buttons */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => addPerson('individual')}
                      className="flex-1 h-12 border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 rounded-2xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Individual
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => addPerson('corporate')}
                      className="flex-1 h-12 border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 rounded-2xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Corporate
                    </Button>
                  </div>
                </div>

                {/* Validation Messages */}
                {Math.abs(totalShareholding - 100) > 0.01 && (
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">
                        {totalShareholding > 100 
                          ? `Shareholding exceeds 100% by ${(totalShareholding - 100).toFixed(1)}%`
                          : `Remaining shareholding: ${(100 - totalShareholding).toFixed(1)}%`
                        }
                      </span>
                    </div>
                  </Card>
                )}

                {!people.some(person => person.is_director) && (
                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">
                        At least one person must be appointed as a Director
                      </span>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-border/30">
              {currentPage > 0 && (
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

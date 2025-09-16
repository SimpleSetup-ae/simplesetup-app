'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Users, FileText, Trash2, AlertCircle, CheckCircle, User, Building2, Percent } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CompanyFormData, ValidationResult, Person as ExistingPerson } from '../../company-formation/types/FormConfig'

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

// Helper function to convert between Person types
const convertToExistingPerson = (person: Person): ExistingPerson => ({
  id: person.id,
  type: person.type === 'individual' ? 'Individual' : 'Corporate',
  email: '', // Will be filled later
  mobile: '', // Will be filled later
  is_pep: false,
  roles: person.is_director ? ['Director'] : [],
  first_name: person.type === 'individual' ? person.name.split(' ')[0] : undefined,
  last_name: person.type === 'individual' ? person.name.split(' ').slice(1).join(' ') : undefined,
  nationality: person.nationality,
  passport_number: person.passport_number,
  legal_name: person.type === 'corporate' ? person.company_name : undefined,
  jurisdiction: person.type === 'corporate' ? person.company_jurisdiction : undefined,
});

const convertFromExistingPerson = (person: ExistingPerson): Person => ({
  id: person.id || Date.now().toString(),
  type: person.type === 'Individual' ? 'individual' : 'corporate',
  name: person.type === 'Individual' 
    ? `${person.first_name || ''} ${person.last_name || ''}`.trim() 
    : person.legal_name || '',
  nationality: person.nationality,
  passport_number: person.passport_number,
  company_name: person.legal_name,
  company_jurisdiction: person.jurisdiction,
  shareholding_percentage: 0, // Will be set by form
  is_director: person.roles.includes('Director'),
  uploaded_documents: person.documents?.map(doc => doc.filename) || []
});

interface PeopleAndDocumentsPageProps {
  formData: CompanyFormData;
  companyId: string;
  onDataChange: (data: any) => void;
  onValidationChange: (result: ValidationResult) => void;
}

export function PeopleAndDocumentsPage({
  formData,
  companyId,
  onDataChange,
  onValidationChange
}: PeopleAndDocumentsPageProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  const shareCapital = formData.share_capital || 10000;
  const shareValue = formData.share_value || 10;
  const totalShares = shareCapital / shareValue;

  // Initialize with existing data or default person
  useEffect(() => {
    if (formData.shareholders && formData.shareholders.length > 0) {
      const convertedPeople = formData.shareholders.map(convertFromExistingPerson);
      setPeople(convertedPeople);
    } else {
      // Create default person
      const defaultPerson: Person = {
        id: '1',
        type: 'individual',
        name: '',
        nationality: '',
        passport_number: '',
        shareholding_percentage: 100,
        is_director: true,
        uploaded_documents: []
      };
      setPeople([defaultPerson]);
    }
  }, [formData.shareholders]);

  // Calculate total shareholding
  const totalShareholding = people.reduce((sum, person) => sum + person.shareholding_percentage, 0);
  const remainingShares = 100 - totalShareholding;

  // Add new person
  const addPerson = (type: 'individual' | 'corporate') => {
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
    
    const updatedPeople = [...people, newPerson];
    setPeople(updatedPeople);
    onDataChange({ shareholders: updatedPeople.map(convertToExistingPerson) });
  };

  // Update person
  const updatePerson = (id: string, updates: Partial<Person>) => {
    const updatedPeople = people.map(person => 
      person.id === id ? { ...person, ...updates } : person
    );
    setPeople(updatedPeople);
    onDataChange({ shareholders: updatedPeople.map(convertToExistingPerson) });
  };

  // Remove person
  const removePerson = (id: string) => {
    const updatedPeople = people.filter(person => person.id !== id);
    setPeople(updatedPeople);
    onDataChange({ shareholders: updatedPeople.map(convertToExistingPerson) });
  };

  // Handle file upload
  const handleFileUpload = async (personId: string, files: FileList) => {
    setUploadingFiles(prev => ({ ...prev, [personId]: true }));
    
    try {
      // Simulate file upload - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const uploadedFileNames = Array.from(files).map(file => file.name);
      const person = people.find(p => p.id === personId);
      
      if (person) {
        updatePerson(personId, {
          uploaded_documents: [...person.uploaded_documents, ...uploadedFileNames]
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [personId]: false }));
    }
  };

  // Validation
  useEffect(() => {
    const errors: string[] = [];
    
    // Check if we have at least one person
    if (people.length === 0) {
      errors.push('At least one shareholder is required');
    }
    
    // Check names are filled
    const hasEmptyNames = people.some(person => 
      !person.name.trim() || 
      (person.type === 'corporate' && !person.company_name?.trim())
    );
    if (hasEmptyNames) {
      errors.push('Please fill in all names');
    }
    
    // Check shareholding totals 100%
    if (Math.abs(totalShareholding - 100) > 0.01) {
      errors.push('Total shareholding must equal 100%');
    }
    
    // Check at least one director
    const hasDirector = people.some(person => person.is_director);
    if (!hasDirector) {
      errors.push('At least one person must be a director');
    }
    
    // Check required documents
    const hasRequiredDocs = people.every(person => person.uploaded_documents.length > 0);
    if (!hasRequiredDocs) {
      errors.push('Please upload required documents for all people');
    }
    
    onValidationChange({
      valid: errors.length === 0,
      errors
    });
  }, [people, totalShareholding, onValidationChange]);

  return (
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
              <div className="font-semibold text-lg text-blue-900">{totalShares.toLocaleString()}</div>
              <div className="text-blue-700">Total Shares</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-blue-900">{shareValue} AED</div>
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
                {person.type === 'individual' ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <Input
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                        placeholder="Enter full name"
                        className="mt-1 h-10 rounded-xl border-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nationality</Label>
                      <Input
                        value={person.nationality || ''}
                        onChange={(e) => updatePerson(person.id, { nationality: e.target.value })}
                        placeholder="e.g., British, Indian"
                        className="mt-1 h-10 rounded-xl border-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Passport Number</Label>
                      <Input
                        value={person.passport_number || ''}
                        onChange={(e) => updatePerson(person.id, { passport_number: e.target.value })}
                        placeholder="Passport number"
                        className="mt-1 h-10 rounded-xl border-2"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Company Name</Label>
                      <Input
                        value={person.company_name || ''}
                        onChange={(e) => updatePerson(person.id, { company_name: e.target.value })}
                        placeholder="Company name"
                        className="mt-1 h-10 rounded-xl border-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Jurisdiction</Label>
                      <Input
                        value={person.company_jurisdiction || ''}
                        onChange={(e) => updatePerson(person.id, { company_jurisdiction: e.target.value })}
                        placeholder="e.g., UAE, UK, Singapore"
                        className="mt-1 h-10 rounded-xl border-2"
                      />
                    </div>
                  </>
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

              {/* Document Upload */}
              <div className="border-t border-border/30 pt-4">
                <Label className="text-sm font-medium mb-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Required Documents
                </Label>
                
                <div className="space-y-2">
                  {person.uploaded_documents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {person.uploaded_documents.map((doc, docIndex) => (
                        <Badge key={docIndex} variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files && handleFileUpload(person.id, e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingFiles[person.id]}
                    />
                    <Button
                      variant="outline"
                      className="w-full h-10 border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 rounded-xl"
                      disabled={uploadingFiles[person.id]}
                    >
                      {uploadingFiles[person.id] ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload {person.type === 'individual' ? 'Passport & ID' : 'Corporate Documents'}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {person.type === 'individual' 
                      ? 'Upload passport copy, Emirates ID (if applicable), and utility bill'
                      : 'Upload certificate of incorporation, memorandum & articles, and good standing certificate'
                    }
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
  );
}

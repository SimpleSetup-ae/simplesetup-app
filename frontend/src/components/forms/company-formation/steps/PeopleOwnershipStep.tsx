'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, User, Building, Upload, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormStep } from '../components/FormStep'
import { SelectionCard } from '../components/SelectionCard'
import { NumberStepper } from '../components/NumberStepper'
import { ValidationResult } from '../types/FormConfig'

interface PersonFormData {
  id: string;
  type: 'individual' | 'corporate';
  name: string;
  nationality?: string;
  passportNumber?: string;
  sharePercentage: number;
  isPEP?: boolean;
  isDirector?: boolean;
  documents?: File[];
}

interface PeopleOwnershipStepProps {
  shareholders: PersonFormData[];
  directors: PersonFormData[];
  shareCapital: number;
  shareValue: number;
  onDataChange: (data: {
    shareholders: PersonFormData[];
    directors: PersonFormData[];
    share_capital: number;
    share_value: number;
  }) => void;
  onValidationChange: (result: ValidationResult) => void;
  validatePerson?: (person: PersonFormData) => Promise<ValidationResult>;
}

export function PeopleOwnershipStep({
  shareholders = [],
  directors = [],
  shareCapital = 1000,
  shareValue = 10,
  onDataChange,
  onValidationChange,
  validatePerson
}: PeopleOwnershipStepProps) {
  const [currentSection, setCurrentSection] = useState<'shareholders' | 'directors'>('shareholders');
  const [pepWarnings, setPepWarnings] = useState<string[]>([]);

  // Calculate total shares
  const totalShares = shareCapital / shareValue;
  const allocatedShares = shareholders.reduce((sum, person) => sum + (person.sharePercentage / 100 * totalShares), 0);
  const remainingShares = totalShares - allocatedShares;

  // Add new person
  const addPerson = (type: 'shareholder' | 'director') => {
    const newPerson: PersonFormData = {
      id: `${type}_${Date.now()}`,
      type: 'individual',
      name: '',
      sharePercentage: type === 'shareholder' ? Math.min(100, (remainingShares / totalShares) * 100) : 0,
      isDirector: type === 'director',
      documents: []
    };

    if (type === 'shareholder') {
      const newShareholders = [...shareholders, newPerson];
      onDataChange({
        shareholders: newShareholders,
        directors,
        share_capital: shareCapital,
        share_value: shareValue
      });
    } else {
      const newDirectors = [...directors, newPerson];
      onDataChange({
        shareholders,
        directors: newDirectors,
        share_capital: shareCapital,
        share_value: shareValue
      });
    }
  };

  // Update person
  const updatePerson = (personId: string, updates: Partial<PersonFormData>, isDirector = false) => {
    const updateList = (list: PersonFormData[]) => 
      list.map(person => 
        person.id === personId 
          ? { ...person, ...updates }
          : person
      );

    if (isDirector) {
      onDataChange({
        shareholders,
        directors: updateList(directors),
        share_capital: shareCapital,
        share_value: shareValue
      });
    } else {
      onDataChange({
        shareholders: updateList(shareholders),
        directors,
        share_capital: shareCapital,
        share_value: shareValue
      });
    }

    // Check for PEP status
    if (updates.isPEP === true) {
      setPepWarnings(prev => [...prev, `${updates.name || 'Person'} is flagged as PEP - application will be blocked`]);
    }
  };

  // Remove person
  const removePerson = (personId: string, isDirector = false) => {
    if (isDirector) {
      const newDirectors = directors.filter(p => p.id !== personId);
      onDataChange({
        shareholders,
        directors: newDirectors,
        share_capital: shareCapital,
        share_value: shareValue
      });
    } else {
      const newShareholders = shareholders.filter(p => p.id !== personId);
      onDataChange({
        shareholders: newShareholders,
        directors,
        share_capital: shareCapital,
        share_value: shareValue
      });
    }
  };

  // Validation
  useEffect(() => {
    const errors: string[] = [];

    if (shareholders.length === 0) {
      errors.push('At least one shareholder is required');
    }

    if (directors.length === 0) {
      errors.push('At least one director is required');
    }

    if (Math.abs(remainingShares) > 0.01) {
      errors.push(`Share allocation mismatch: ${remainingShares.toFixed(0)} shares remaining`);
    }

    // Check for PEP blocking
    const hasPEP = [...shareholders, ...directors].some(person => person.isPEP);
    if (hasPEP) {
      errors.push('PEP detected - application cannot proceed');
    }

    // Check for incomplete information
    [...shareholders, ...directors].forEach(person => {
      if (!person.name.trim()) {
        errors.push('All people must have names');
      }
      if (person.type === 'individual' && !person.nationality) {
        errors.push('Nationality required for individuals');
      }
    });

    onValidationChange({
      valid: errors.length === 0,
      errors
    });
  }, [shareholders, directors, remainingShares, onValidationChange]);

  const PersonForm = ({ person, isDirector = false }: { person: PersonFormData; isDirector?: boolean }) => (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {isDirector ? 'Director' : 'Shareholder'} {person.name || 'New Person'}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removePerson(person.id, isDirector)}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Person Type */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex space-x-4">
          <SelectionCard
            id={`${person.id}-individual`}
            label="Individual"
            selected={person.type === 'individual'}
            onClick={() => updatePerson(person.id, { type: 'individual' }, isDirector)}
          >
            <User className="h-5 w-5" />
          </SelectionCard>
          <SelectionCard
            id={`${person.id}-corporate`}
            label="Corporate"
            selected={person.type === 'corporate'}
            onClick={() => updatePerson(person.id, { type: 'corporate' }, isDirector)}
          >
            <Building className="h-5 w-5" />
          </SelectionCard>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label>{person.type === 'individual' ? 'Full Name' : 'Company Name'}</Label>
        <Input
          value={person.name}
          onChange={(e) => updatePerson(person.id, { name: e.target.value }, isDirector)}
          placeholder={person.type === 'individual' ? 'Enter full name' : 'Enter company name'}
        />
      </div>

      {/* Individual-specific fields */}
      {person.type === 'individual' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input
                value={person.nationality || ''}
                onChange={(e) => updatePerson(person.id, { nationality: e.target.value }, isDirector)}
                placeholder="Nationality"
              />
            </div>
            <div className="space-y-2">
              <Label>Passport Number</Label>
              <Input
                value={person.passportNumber || ''}
                onChange={(e) => updatePerson(person.id, { passportNumber: e.target.value }, isDirector)}
                placeholder="Passport number"
              />
            </div>
          </div>

          {/* PEP Check */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`pep-${person.id}`}
              checked={person.isPEP || false}
              onChange={(e) => updatePerson(person.id, { isPEP: e.target.checked }, isDirector)}
              className="rounded"
            />
            <Label htmlFor={`pep-${person.id}`} className="text-sm">
              This person is a Politically Exposed Person (PEP)
            </Label>
          </div>
        </>
      )}

      {/* Share percentage for shareholders */}
      {!isDirector && (
        <div className="space-y-2">
          <Label>Share Percentage</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={person.sharePercentage}
              onChange={(e) => updatePerson(person.id, { sharePercentage: parseFloat(e.target.value) || 0 })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <span className="text-sm text-muted-foreground">
              ({Math.round((person.sharePercentage / 100) * totalShares)} shares)
            </span>
          </div>
        </div>
      )}

      {person.isPEP && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            PEP detected - this application cannot proceed and will be blocked.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <FormStep
      title="People & ownership"
      subtitle="Who's involved and who owns what"
    >
      <div className="space-y-6">
        {/* Section Navigation */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={currentSection === 'shareholders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentSection('shareholders')}
            className="flex-1"
          >
            Shareholders ({shareholders.length})
          </Button>
          <Button
            variant={currentSection === 'directors' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentSection('directors')}
            className="flex-1"
          >
            Directors ({directors.length})
          </Button>
        </div>

        {/* Share Capital Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalShares.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Shares</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{allocatedShares.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Allocated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{remainingShares.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>

        {/* PEP Warnings */}
        {pepWarnings.length > 0 && (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {pepWarnings.map((warning, index) => (
                  <div key={index}>{warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Shareholders Section */}
        {currentSection === 'shareholders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Shareholders</h3>
              <Button onClick={() => addPerson('shareholder')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Shareholder
              </Button>
            </div>

            {shareholders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shareholders added yet. Click "Add Shareholder" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {shareholders.map(person => (
                  <PersonForm key={person.id} person={person} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Directors Section */}
        {currentSection === 'directors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Directors</h3>
              <Button onClick={() => addPerson('director')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Director
              </Button>
            </div>

            {directors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No directors added yet. Click "Add Director" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {directors.map(person => (
                  <PersonForm key={person.id} person={person} isDirector={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FormStep>
  );
}

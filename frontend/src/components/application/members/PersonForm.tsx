'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Trash2, User, Building } from 'lucide-react'

interface Person {
  id: string
  type: 'Individual' | 'Corporate'
  role: 'shareholder' | 'director' | 'general_manager' | 'both'

  // Individual fields
  first_name?: string
  middle_name?: string
  last_name?: string
  gender?: 'Male' | 'Female'
  date_of_birth?: string
  nationality?: string
  passport_number?: string
  passport_issue_date?: string
  passport_expiry_date?: string
  passport_issue_country?: string
  passport_issue_place?: string
  share_percentage?: number

  // Corporate fields
  company_name?: string
  registration_number?: string
  jurisdiction?: string

  // Contact
  email?: string
  phone?: string
  address?: string

  // Documents
  passport_file_url?: string
}

interface PersonFormProps {
  person: Person
  onUpdate: (person: Person) => void
  onDelete?: () => void
  showDelete?: boolean
  isEditing?: boolean
}

const NATIONALITIES = [
  'UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Qatar', 'Oman',
  'United Kingdom', 'United States', 'Canada', 'Australia',
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Japan', 'South Korea', 'Singapore', 'China', 'India',
  'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Maldives',
  'Other'
]

export function PersonForm({
  person,
  onUpdate,
  onDelete,
  showDelete = false,
  isEditing = false
}: PersonFormProps) {
  const [localPerson, setLocalPerson] = useState<Person>(person)

  const handleFieldChange = (field: keyof Person, value: string | number) => {
    const updatedPerson = { ...localPerson, [field]: value }
    setLocalPerson(updatedPerson)
    onUpdate(updatedPerson)
  }

  const handleCorporateFieldChange = (field: keyof Person, value: string | number) => {
    const updatedPerson = { ...localPerson, [field]: value }
    setLocalPerson(updatedPerson)
    onUpdate(updatedPerson)
  }

  const renderIndividualFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={localPerson.first_name || ''}
            onChange={(e) => handleFieldChange('first_name', e.target.value)}
            placeholder="Enter first name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="middle_name">Middle Name</Label>
          <Input
            id="middle_name"
            value={localPerson.middle_name || ''}
            onChange={(e) => handleFieldChange('middle_name', e.target.value)}
            placeholder="Enter middle name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={localPerson.last_name || ''}
            onChange={(e) => handleFieldChange('last_name', e.target.value)}
            placeholder="Enter last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={localPerson.gender || ''}
            onValueChange={(value) => handleFieldChange('gender', value as 'Male' | 'Female')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={localPerson.date_of_birth || ''}
            onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Select
            value={localPerson.nationality || ''}
            onValueChange={(value) => handleFieldChange('nationality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              {NATIONALITIES.map(nationality => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passport_number">Passport Number *</Label>
          <Input
            id="passport_number"
            value={localPerson.passport_number || ''}
            onChange={(e) => handleFieldChange('passport_number', e.target.value)}
            placeholder="Enter passport number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passport_issue_date">Passport Issue Date</Label>
          <Input
            id="passport_issue_date"
            type="date"
            value={localPerson.passport_issue_date || ''}
            onChange={(e) => handleFieldChange('passport_issue_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passport_expiry_date">Passport Expiry Date</Label>
          <Input
            id="passport_expiry_date"
            type="date"
            value={localPerson.passport_expiry_date || ''}
            onChange={(e) => handleFieldChange('passport_expiry_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passport_issue_country">Passport Issue Country</Label>
          <Input
            id="passport_issue_country"
            value={localPerson.passport_issue_country || ''}
            onChange={(e) => handleFieldChange('passport_issue_country', e.target.value)}
            placeholder="Enter issue country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passport_issue_place">Passport Issue Place</Label>
          <Input
            id="passport_issue_place"
            value={localPerson.passport_issue_place || ''}
            onChange={(e) => handleFieldChange('passport_issue_place', e.target.value)}
            placeholder="Enter issue place"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="share_percentage">Share Percentage (%)</Label>
          <Input
            id="share_percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={localPerson.share_percentage || ''}
            onChange={(e) => handleFieldChange('share_percentage', parseFloat(e.target.value) || 0)}
            placeholder="Enter share percentage"
          />
        </div>
      </div>
    </>
  )

  const renderCorporateFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={localPerson.company_name || ''}
            onChange={(e) => handleCorporateFieldChange('company_name', e.target.value)}
            placeholder="Enter company name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration_number">Registration Number</Label>
          <Input
            id="registration_number"
            value={localPerson.registration_number || ''}
            onChange={(e) => handleCorporateFieldChange('registration_number', e.target.value)}
            placeholder="Enter registration number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jurisdiction">Jurisdiction</Label>
          <Select
            value={localPerson.jurisdiction || ''}
            onValueChange={(value) => handleCorporateFieldChange('jurisdiction', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              {NATIONALITIES.map(jurisdiction => (
                <SelectItem key={jurisdiction} value={jurisdiction}>
                  {jurisdiction}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="share_percentage">Share Percentage (%)</Label>
          <Input
            id="share_percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={localPerson.share_percentage || ''}
            onChange={(e) => handleCorporateFieldChange('share_percentage', parseFloat(e.target.value) || 0)}
            placeholder="Enter share percentage"
          />
        </div>
      </div>
    </>
  )

  const renderContactFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={localPerson.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          placeholder="Enter email address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={localPerson.phone || ''}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={localPerson.address || ''}
          onChange={(e) => handleFieldChange('address', e.target.value)}
          placeholder="Enter address"
        />
      </div>
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          {localPerson.type === 'Individual' ? (
            <User className="h-5 w-5 text-blue-600" />
          ) : (
            <Building className="h-5 w-5 text-green-600" />
          )}
          <CardTitle className="text-lg">
            {localPerson.type === 'Individual'
              ? `${localPerson.first_name || 'New'} ${localPerson.last_name || 'Person'}`
              : localPerson.company_name || 'New Corporate Entity'
            }
          </CardTitle>
        </div>

        {showDelete && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Person Type Selection */}
        <div className="space-y-2">
          <Label>Type</Label>
          <RadioGroup
            value={localPerson.type}
            onValueChange={(value) => handleFieldChange('type', value as 'Individual' | 'Corporate')}
            className="flex flex-row space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Individual" id="individual" />
              <Label htmlFor="individual">Individual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Corporate" id="corporate" />
              <Label htmlFor="corporate">Corporate</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Person-specific fields */}
        {localPerson.type === 'Individual' ? renderIndividualFields() : renderCorporateFields()}

        {/* Contact Information */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-4">Contact Information</h4>
          {renderContactFields()}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label>Role in Company</Label>
          <div className="flex flex-wrap gap-2">
            {['shareholder', 'director', 'general_manager'].map(role => (
              <label key={role} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localPerson.role === role || localPerson.role === 'both'}
                  onChange={(e) => {
                    const currentRoles = localPerson.role === 'both' ? ['shareholder', 'director', 'general_manager'] : [localPerson.role]
                    if (e.target.checked) {
                      if (currentRoles.includes(role)) return
                      const newRoles = [...currentRoles, role]
                      const finalRole = newRoles.length > 1 ? 'both' : newRoles[0] as Person['role']
                      handleFieldChange('role', finalRole)
                    } else {
                      const newRoles = currentRoles.filter(r => r !== role)
                      const finalRole = newRoles.length > 1 ? 'both' : newRoles[0] as Person['role']
                      handleFieldChange('role', finalRole)
                    }
                  }}
                />
                <span className="capitalize">{role.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

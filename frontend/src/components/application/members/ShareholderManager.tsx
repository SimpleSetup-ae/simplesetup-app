'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PersonForm } from './PersonForm'
import { Plus, Users, AlertTriangle } from 'lucide-react'

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

interface ShareholderManagerProps {
  shareholders: Person[]
  onUpdateShareholders: (shareholders: Person[]) => void
  totalShares?: number
}

export function ShareholderManager({
  shareholders,
  onUpdateShareholders,
  totalShares = 100
}: ShareholderManagerProps) {
  const [errors, setErrors] = useState<string[]>([])

  const handleAddShareholder = () => {
    const newShareholder: Person = {
      id: crypto.randomUUID(),
      type: 'Individual',
      role: 'shareholder',
      first_name: '',
      last_name: '',
      nationality: '',
      passport_number: '',
      share_percentage: 0
    }

    onUpdateShareholders([...shareholders, newShareholder])
  }

  const handleUpdateShareholder = (updatedShareholder: Person) => {
    const updatedShareholders = shareholders.map(s =>
      s.id === updatedShareholder.id ? updatedShareholder : s
    )
    onUpdateShareholders(updatedShareholders)
  }

  const handleDeleteShareholder = (shareholderId: string) => {
    const updatedShareholders = shareholders.filter(s => s.id !== shareholderId)
    onUpdateShareholders(updatedShareholders)
  }

  const validateShareholders = (): string[] => {
    const validationErrors: string[] = []

    // Check total share percentage
    const totalSharePercentage = shareholders.reduce((total, s) => total + (s.share_percentage || 0), 0)
    if (totalSharePercentage > totalShares) {
      validationErrors.push(`Total share percentage cannot exceed ${totalShares}%`)
    }

    // Check minimum one shareholder
    if (shareholders.length === 0) {
      validationErrors.push('At least one shareholder is required')
    }

    // Validate individual shareholders
    shareholders.forEach((shareholder, index) => {
      if (shareholder.type === 'Individual') {
        if (!shareholder.first_name || !shareholder.last_name) {
          validationErrors.push(`Shareholder ${index + 1}: Name is required`)
        }
        if (!shareholder.passport_number) {
          validationErrors.push(`Shareholder ${index + 1}: Passport number is required`)
        }
        if (!shareholder.nationality) {
          validationErrors.push(`Shareholder ${index + 1}: Nationality is required`)
        }
      } else {
        if (!shareholder.company_name) {
          validationErrors.push(`Corporate shareholder ${index + 1}: Company name is required`)
        }
      }
    })

    return validationErrors
  }

  const handleValidate = () => {
    const validationErrors = validateShareholders()
    setErrors(validationErrors)
    return validationErrors.length === 0
  }

  const getShareholdersSummary = () => {
    const individualCount = shareholders.filter(s => s.type === 'Individual').length
    const corporateCount = shareholders.filter(s => s.type === 'Corporate').length
    const totalSharePercentage = shareholders.reduce((total, s) => total + (s.share_percentage || 0), 0)
    const remainingShares = totalShares - totalSharePercentage

    return {
      individualCount,
      corporateCount,
      totalSharePercentage,
      remainingShares
    }
  }

  const summary = getShareholdersSummary()

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>Shareholders ({shareholders.length})</CardTitle>
            </div>
            <Button onClick={handleAddShareholder} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Shareholder
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{summary.individualCount}</div>
              <div className="text-sm text-gray-500">Individual</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{summary.corporateCount}</div>
              <div className="text-sm text-gray-500">Corporate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{summary.totalSharePercentage}%</div>
              <div className="text-sm text-gray-500">Allocated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{summary.remainingShares}%</div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
          </div>

          {summary.remainingShares < 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Total share percentage exceeds {totalShares}%. Please adjust the percentages.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Please fix the following errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Shareholders List */}
      <div className="space-y-4">
        {shareholders.map((shareholder, index) => (
          <div key={shareholder.id} className="relative">
            <div className="absolute -top-2 -left-2 z-10">
              <Badge variant="secondary">
                Shareholder {index + 1}
              </Badge>
            </div>

            <PersonForm
              person={shareholder}
              onUpdate={handleUpdateShareholder}
              onDelete={() => handleDeleteShareholder(shareholder.id)}
              showDelete={shareholders.length > 1}
              isEditing={true}
            />
          </div>
        ))}

        {shareholders.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Shareholders Added</h3>
              <p className="text-gray-500 text-center mb-4">
                Add at least one shareholder to continue with company formation.
              </p>
              <Button onClick={handleAddShareholder}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Shareholder
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Export validation function for parent component */}
      <div style={{ display: 'none' }}>
        <button
          data-testid="validate-shareholders"
          onClick={() => handleValidate()}
          type="button"
        >
          Validate Shareholders
        </button>
      </div>
    </div>
  )
}

// Export validation function for use by parent components
export const validateShareholders = (shareholders: Person[], totalShares: number = 100): string[] => {
  const errors: string[] = []

  // Check total share percentage
  const totalSharePercentage = shareholders.reduce((total, s) => total + (s.share_percentage || 0), 0)
  if (totalSharePercentage > totalShares) {
    errors.push(`Total share percentage cannot exceed ${totalShares}%`)
  }

  // Check minimum one shareholder
  if (shareholders.length === 0) {
    errors.push('At least one shareholder is required')
  }

  // Validate individual shareholders
  shareholders.forEach((shareholder, index) => {
    if (shareholder.type === 'Individual') {
      if (!shareholder.first_name || !shareholder.last_name) {
        errors.push(`Shareholder ${index + 1}: Name is required`)
      }
      if (!shareholder.passport_number) {
        errors.push(`Shareholder ${index + 1}: Passport number is required`)
      }
      if (!shareholder.nationality) {
        errors.push(`Shareholder ${index + 1}: Nationality is required`)
      }
    } else {
      if (!shareholder.company_name) {
        errors.push(`Corporate shareholder ${index + 1}: Company name is required`)
      }
    }
  })

  return errors
}

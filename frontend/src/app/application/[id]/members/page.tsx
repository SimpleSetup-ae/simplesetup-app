'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PricingBanner } from '@/components/application/PricingBanner'
import { PassportUpload } from '@/components/application/PassportUpload'
import { 
  ArrowLeft, ArrowRight, Info, Upload, User, Building, 
  Loader2, Check, X, Plus, Trash2, FileText 
} from 'lucide-react'

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
  passport_file?: File
  documents?: any[]
  
  // Validation
  is_pep?: boolean
  has_uae_visa?: boolean
  has_visited_uae?: boolean
}

export default function MembersPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress } = useApplication()
  
  const [shareholders, setShareholders] = useState<Person[]>(
    applicationData.shareholders || []
  )
  const [generalManager, setGeneralManager] = useState<Person | null>(
    applicationData.general_manager || null
  )
  const [activeTab, setActiveTab] = useState('shareholders')
  const [showAddGMModal, setShowAddGMModal] = useState(false)
  const [extracting, setExtracting] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [totalShares, setTotalShares] = useState(100)
  
  useEffect(() => {
    updateProgress(5, 'members')
  }, [])
  
  const handleAddPerson = (type: 'shareholder') => {
    const newPerson: Person = {
      id: `${Date.now()}_${Math.random()}`,
      type: applicationData.shareholding_type === 'corporate' ? 'Corporate' : 'Individual',
      role: type,
      share_percentage: type === 'shareholder' ? (shareholders.length === 0 ? 100 : Math.floor(100 / (shareholders.length + 1))) : undefined
    }
    
    if (type === 'shareholder') {
      // Redistribute shares evenly when adding new shareholder
      const newShareholdersList = [...shareholders, newPerson]
      const equalShare = Math.floor(100 / newShareholdersList.length)
      const updatedShareholders = newShareholdersList.map((s, index) => ({
        ...s,
        share_percentage: index === newShareholdersList.length - 1 ? 
          100 - (equalShare * (newShareholdersList.length - 1)) : // Last shareholder gets remainder
          equalShare
      }))
      setShareholders(updatedShareholders)
    }
  }
  
  const handleRemovePerson = (id: string, type: 'shareholder') => {
    if (type === 'shareholder') {
      const updatedShareholders = shareholders.filter(s => s.id !== id)
      // Redistribute shares evenly after removal
      if (updatedShareholders.length > 0) {
        const equalShare = Math.floor(100 / updatedShareholders.length)
        const redistributedShareholders = updatedShareholders.map((s, index) => ({
          ...s,
          share_percentage: index === updatedShareholders.length - 1 ? 
            100 - (equalShare * (updatedShareholders.length - 1)) : // Last shareholder gets remainder
            equalShare
        }))
        setShareholders(redistributedShareholders)
      } else {
        setShareholders([])
      }
    }
  }
  
  const handleUpdatePerson = (id: string, updates: Partial<Person>, type: 'shareholder' | 'general_manager') => {
    if (type === 'shareholder') {
      setShareholders(shareholders.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ))
    } else if (type === 'general_manager') {
      setGeneralManager(prev => prev ? { ...prev, ...updates } : null)
    }
  }
  
  const handleExtractedData = (personId: string, data: any, type: 'shareholder' | 'general_manager') => {
    // Map extracted data to person fields
    const extractedPerson: Partial<Person> = {
      first_name: data.first_name || '',
      middle_name: data.middle_name || '',
      last_name: data.last_name || '',
      gender: data.gender as 'Male' | 'Female',
      date_of_birth: data.date_of_birth || '',
      nationality: data.nationality || '',
      passport_number: data.passport_number || '',
      passport_issue_date: data.passport_issue_date || '',
      passport_expiry_date: data.passport_expiry_date || '',
      passport_issue_country: data.passport_issue_country || '',
      passport_issue_place: data.passport_issue_place || ''
    }
    
    // Update the person with extracted data
    handleUpdatePerson(personId, extractedPerson, type)
  }
  
  const validateShares = () => {
    const totalPercentage = shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0)
    return totalPercentage === 100
  }

  const handleSelectExistingAsGM = (shareholderId: string) => {
    const selectedShareholder = shareholders.find(s => s.id === shareholderId)
    if (selectedShareholder) {
      setGeneralManager({
        ...selectedShareholder,
        id: `gm_${Date.now()}`,
        role: 'general_manager',
        share_percentage: undefined // GM doesn't have shares unless they're also a shareholder
      })
      setShowAddGMModal(false)
    }
  }

  const handleCreateNewGM = () => {
    const newGM: Person = {
      id: `gm_${Date.now()}_${Math.random()}`,
      type: 'Individual',
      role: 'general_manager'
    }
    setGeneralManager(newGM)
    setShowAddGMModal(false)
  }
  
  const validateAndContinue = async () => {
    const validationErrors = []
    
    // Validate shareholders
    if (shareholders.length === 0) {
      validationErrors.push('At least one shareholder is required')
    }
    
    if (!validateShares()) {
      validationErrors.push('Total shareholding must equal 100%')
    }
    
    // Validate general manager
    if (!generalManager) {
      validationErrors.push('A General Manager is required')
    }
    
    // Check for PEP
    const hasPEP = [...shareholders, ...(generalManager ? [generalManager] : [])].some(p => p.is_pep)
    if (hasPEP) {
      validationErrors.push('Politically Exposed Persons (PEPs) require special approval')
    }
    
    // Validate required fields
    shareholders.forEach((s, index) => {
      if (s.type === 'Individual') {
        if (!s.first_name || !s.last_name) {
          validationErrors.push(`Shareholder ${index + 1}: Name is required`)
        }
        if (!s.passport_number) {
          validationErrors.push(`Shareholder ${index + 1}: Passport number is required`)
        }
      } else {
        if (!s.company_name) {
          validationErrors.push(`Corporate shareholder ${index + 1}: Company name is required`)
        }
      }
    })
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    // Save data
    await updateApplication({
      shareholders,
      general_manager: generalManager
    }, 'members')
    
    // Check if UBO screen is needed based on shareholding type
    const shareholdingType = applicationData.shareholding_type
    const requiresUBO = shareholdingType === 'corporate' || shareholdingType === 'mixed'
    
    if (requiresUBO) {
      // Navigate to UBO screen for corporate or mixed shareholding types
      router.push(`/application/${params.id}/ubos`)
    } else {
      // Skip UBO screen for individual shareholders only - go directly to review
      router.push(`/application/${params.id}/review`)
    }
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/shareholding`)
  }
  
  const renderPersonCard = (person: Person, type: 'shareholder' | 'general_manager') => (
    <Card key={person.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            {(person.type === 'Individual' || applicationData.shareholding_type === 'individual') ? (
              <User className="h-5 w-5 text-gray-500" />
            ) : (
              <Building className="h-5 w-5 text-gray-500" />
            )}
            <span className="font-medium">
              {(person.type === 'Individual' || applicationData.shareholding_type === 'individual') ? 'Individual' : 'Corporate Entity'}
              {type === 'general_manager' && <span className="text-blue-600 ml-2">(General Manager)</span>}
            </span>
            {type === 'shareholder' && person.share_percentage !== undefined && (
              <Badge>{person.share_percentage}% Share</Badge>
            )}
          </div>
          {type !== 'general_manager' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemovePerson(person.id, type)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
          {type === 'general_manager' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setGeneralManager(null)}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
        
        {(person.type === 'Individual' || applicationData.shareholding_type === 'individual') ? (
          <div className="space-y-4">
            {/* Passport Upload */}
            <div>
              <Label>Passport Upload (AI will extract details)</Label>
              <div className="mt-2">
                <PassportUpload
                  applicationId={params.id}
                  personId={person.id}
                  onExtractedData={(data) => handleExtractedData(person.id, data, type)}
                  onError={(error) => setErrors([error])}
                  onProcessingStart={() => setExtracting(person.id)}
                  onProcessingEnd={() => setExtracting(null)}
                  disabled={extracting === person.id}
                  existingData={person}
                  showUploadedState={!!(person.first_name && person.last_name && person.passport_number)}
                />
              </div>
            </div>
            
            {/* Name Fields with AI Processing Overlay */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor={`first-${person.id}`}>First Name</Label>
                  {extracting === person.id ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id={`first-${person.id}`}
                      value={person.first_name || ''}
                      onChange={(e) => handleUpdatePerson(person.id, { first_name: e.target.value }, type)}
                      className={person.passport_file ? 'bg-green-50' : ''}
                      disabled={extracting === person.id}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor={`middle-${person.id}`}>Middle Name</Label>
                  {extracting === person.id ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id={`middle-${person.id}`}
                      value={person.middle_name || ''}
                      onChange={(e) => handleUpdatePerson(person.id, { middle_name: e.target.value }, type)}
                      disabled={extracting === person.id}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor={`last-${person.id}`}>Last Name</Label>
                  {extracting === person.id ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id={`last-${person.id}`}
                      value={person.last_name || ''}
                      onChange={(e) => handleUpdatePerson(person.id, { last_name: e.target.value }, type)}
                      className={person.passport_file ? 'bg-green-50' : ''}
                      disabled={extracting === person.id}
                    />
                  )}
                </div>
              </div>
              
              {/* Grey Transparent Overlay During AI Processing */}
              {extracting === person.id && (
                <div className="absolute inset-0 bg-gray-500/20 backdrop-blur-[1px] rounded-md flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      Processing...
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Other Details with AI Processing Overlay */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`gender-${person.id}`}>Gender</Label>
                  {extracting === person.id ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={person.gender}
                      onValueChange={(value) => handleUpdatePerson(person.id, { gender: value as 'Male' | 'Female' }, type)}
                      disabled={extracting === person.id}
                    >
                      <SelectTrigger id={`gender-${person.id}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor={`dob-${person.id}`}>Date of Birth</Label>
                  {extracting === person.id ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id={`dob-${person.id}`}
                      type="date"
                      value={person.date_of_birth || ''}
                      onChange={(e) => handleUpdatePerson(person.id, { date_of_birth: e.target.value }, type)}
                      className={person.passport_file ? 'bg-green-50' : ''}
                      disabled={extracting === person.id}
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label htmlFor={`nationality-${person.id}`}>Nationality</Label>
                  {extracting === person.id ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id={`nationality-${person.id}`}
                      value={person.nationality || ''}
                      onChange={(e) => handleUpdatePerson(person.id, { nationality: e.target.value }, type)}
                      className={person.passport_file ? 'bg-green-50' : ''}
                      disabled={extracting === person.id}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor={`passport-${person.id}`}>Passport Number</Label>
                  {extracting === person.id ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id={`passport-${person.id}`}
                      value={person.passport_number || ''}
                      onChange={(e) => handleUpdatePerson(person.id, { passport_number: e.target.value }, type)}
                      className={person.passport_file ? 'bg-green-50' : ''}
                      disabled={extracting === person.id}
                    />
                  )}
                </div>
              </div>
              
              {/* Grey Transparent Overlay During AI Processing */}
              {extracting === person.id && (
                <div className="absolute inset-0 bg-gray-500/20 backdrop-blur-[1px] rounded-md flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      Processing...
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Share percentage for shareholders */}
            {type === 'shareholder' && (
              <div>
                <Label htmlFor={`shares-${person.id}`}>Share Percentage (%)</Label>
                <Input
                  id={`shares-${person.id}`}
                  type="number"
                  min="0"
                  max="100"
                  value={person.share_percentage || 0}
                  onChange={(e) => handleUpdatePerson(person.id, { share_percentage: parseInt(e.target.value) || 0 }, type)}
                />
              </div>
            )}
            
            {/* PEP Check */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={person.is_pep || false}
                    onChange={(e) => handleUpdatePerson(person.id, { is_pep: e.target.checked }, type)}
                  />
                  <span className="text-sm">This person is a Politically Exposed Person (PEP)</span>
                </label>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          // Corporate Entity Form
          <div className="space-y-4">
            <div>
              <Label htmlFor={`company-${person.id}`}>Company Name</Label>
              <Input
                id={`company-${person.id}`}
                value={person.company_name || ''}
                onChange={(e) => handleUpdatePerson(person.id, { company_name: e.target.value }, type)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`reg-${person.id}`}>Registration Number</Label>
                <Input
                  id={`reg-${person.id}`}
                  value={person.registration_number || ''}
                  onChange={(e) => handleUpdatePerson(person.id, { registration_number: e.target.value }, type)}
                />
              </div>
              <div>
                <Label htmlFor={`jurisdiction-${person.id}`}>Jurisdiction</Label>
                <Input
                  id={`jurisdiction-${person.id}`}
                  value={person.jurisdiction || ''}
                  onChange={(e) => handleUpdatePerson(person.id, { jurisdiction: e.target.value }, type)}
                />
              </div>
            </div>
            {type === 'shareholder' && (
              <div>
                <Label htmlFor={`corp-shares-${person.id}`}>Share Percentage (%)</Label>
                <Input
                  id={`corp-shares-${person.id}`}
                  type="number"
                  min="0"
                  max="100"
                  value={person.share_percentage || 0}
                  onChange={(e) => handleUpdatePerson(person.id, { share_percentage: parseInt(e.target.value) || 0 }, type)}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Members</CardTitle>
                <CardDescription>
                  Add shareholders and select a General Manager. Upload passports to auto-fill details with AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="shareholders">
                      Shareholders ({shareholders.length})
                    </TabsTrigger>
                    <TabsTrigger value="general_manager">
                      General Manager {generalManager ? '(1)' : '(0)'}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="shareholders" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium">Shareholders</h3>
                        <p className="text-sm text-gray-500">
                          Total shares: {shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0)}%
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddPerson('shareholder')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Shareholder
                      </Button>
                    </div>
                    
                    {shareholders.length === 0 ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No shareholders added yet. Click "Add Shareholder" to begin.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      shareholders.map(person => renderPersonCard(person, 'shareholder'))
                    )}
                    
                    {shareholders.length > 0 && !validateShares() && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>Share percentage warning:</strong> Total shareholding must equal 100%. 
                          Current total: {shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0)}%
                          {shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0) < 100 && (
                            <span> - Missing {100 - shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0)}%</span>
                          )}
                          {shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0) > 100 && (
                            <span> - Excess {shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0) - 100}%</span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="general_manager" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium">General Manager</h3>
                        <p className="text-sm text-gray-500">
                          Select an existing shareholder or add a new person as General Manager
                        </p>
                      </div>
                      {!generalManager && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddGMModal(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add General Manager
                        </Button>
                      )}
                    </div>
                    
                    {!generalManager ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No General Manager selected yet. A General Manager is required for company formation.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      renderPersonCard(generalManager, 'general_manager')
                    )}
                  </TabsContent>
                </Tabs>
                
                {/* Errors */}
                {errors.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                      <ul className="list-disc pl-4">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={validateAndContinue}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Pricing Banner */}
          <div className="lg:col-span-1">
            <PricingBanner />
          </div>
        </div>
      </div>
      
      {/* Add General Manager Modal */}
      {showAddGMModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add General Manager</h3>
            
            {shareholders.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Select from existing shareholders:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {shareholders.map(shareholder => (
                    <button
                      key={shareholder.id}
                      onClick={() => handleSelectExistingAsGM(shareholder.id)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">
                        {shareholder.first_name} {shareholder.last_name}
                        {shareholder.company_name && ` (${shareholder.company_name})`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shareholder.nationality} • {shareholder.share_percentage}% shares
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="my-4 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={handleCreateNewGM}
                className="w-full"
                variant="outline"
              >
                <User className="h-4 w-4 mr-2" />
                Add New Person as General Manager
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowAddGMModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

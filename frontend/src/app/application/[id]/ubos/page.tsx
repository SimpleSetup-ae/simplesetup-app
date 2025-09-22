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
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PricingBanner } from '@/components/application/PricingBanner'
import { 
  ArrowLeft, ArrowRight, Info, Upload, AlertCircle, 
  Loader2, Check, Plus, Trash2, FileText, Shield 
} from 'lucide-react'

interface UBO {
  id: string
  name: string
  nationality: string
  passport_number: string
  passport_file?: File
  poa_file?: File
  declaration_file?: File
  passport_photo_file?: File
  home_country_id_file?: File
  relationship_proof_file?: File
  
  percentage: number
  capacity: string
  employer_name?: string
  employer_address?: string
  entities_count?: number
  
  is_pep: boolean
  special_arrangement: boolean
  special_arrangement_type?: string
  special_arrangement_docs?: File[]
  
  linked_member_id?: string // Links to shareholder/director
}

export default function UBOsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress } = useApplication()
  
  const [ubos, setUbos] = useState<UBO[]>(applicationData.ubos || [])
  const [extracting, setExtracting] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [gmSignatoryName, setGmSignatoryName] = useState(applicationData.gm_signatory_name || '')
  const [gmSignatoryEmail, setGmSignatoryEmail] = useState(applicationData.gm_signatory_email || '')
  const [termsAccepted, setTermsAccepted] = useState(applicationData.ubo_terms_accepted || false)
  
  useEffect(() => {
    updateProgress(6, 'ubos')
    
    // Check if UBOs are required based on shareholding type
    const shareholdingType = applicationData.shareholding_type
    const requiresUBO = shareholdingType === 'corporate' || shareholdingType === 'mixed'
    
    // If UBOs are not required, redirect to review page
    if (!requiresUBO) {
      router.push(`/application/${params.id}/review`)
      return
    }
    
    // Auto-detect UBOs from corporate shareholders with >= 25% ownership
    if (ubos.length === 0 && applicationData.shareholders) {
      const significantCorporateShareholders = applicationData.shareholders
        .filter((s: any) => s.type === 'Corporate' && s.share_percentage >= 25)
        .map((s: any) => ({
          id: `ubo_${Date.now()}_${Math.random()}`,
          name: s.company_name || `${s.first_name} ${s.last_name}`.trim(),
          nationality: s.nationality || '',
          passport_number: s.passport_number || '',
          percentage: s.share_percentage,
          capacity: 'Corporate Shareholder UBO',
          is_pep: false,
          special_arrangement: false,
          linked_member_id: s.id
        }))
      
      if (significantCorporateShareholders.length > 0) {
        setUbos(significantCorporateShareholders)
      }
    }
  }, [applicationData.shareholders, router, params.id])
  
  const handleAddUBO = () => {
    const newUBO: UBO = {
      id: `ubo_${Date.now()}_${Math.random()}`,
      name: '',
      nationality: '',
      passport_number: '',
      percentage: 0,
      capacity: 'Direct Shareholder',
      is_pep: false,
      special_arrangement: false
    }
    setUbos([...ubos, newUBO])
  }
  
  const handleRemoveUBO = (id: string) => {
    setUbos(ubos.filter(u => u.id !== id))
  }
  
  const handleUpdateUBO = (id: string, updates: Partial<UBO>) => {
    setUbos(ubos.map(u => u.id === id ? { ...u, ...updates } : u))
  }
  
  const handlePassportUpload = async (file: File, uboId: string) => {
    setExtracting(uboId)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`/api/v1/applications/${params.id}/documents/extract_passport`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success && data.extracted) {
        handleUpdateUBO(uboId, {
          name: `${data.extracted.first_name} ${data.extracted.last_name}`.trim(),
          nationality: data.extracted.nationality || '',
          passport_number: data.extracted.passport_number || '',
          passport_file: file
        })
      }
    } catch (err) {
      console.error('Passport extraction error:', err)
    } finally {
      setExtracting(null)
    }
  }
  
  const validateAndContinue = async () => {
    const validationErrors = []
    
    // Check if UBOs are required based on shareholding type
    const shareholdingType = applicationData.shareholding_type
    const requiresUBO = shareholdingType === 'corporate' || shareholdingType === 'mixed'
    
    if (requiresUBO && ubos.length === 0) {
      validationErrors.push('Ultimate Beneficial Owners declaration is required for corporate or mixed shareholding types')
    }
    
    // Validate each UBO
    ubos.forEach((ubo, index) => {
      if (!ubo.name) {
        validationErrors.push(`UBO ${index + 1}: Name is required`)
      }
      if (!ubo.nationality) {
        validationErrors.push(`UBO ${index + 1}: Nationality is required`)
      }
      if (ubo.percentage < 25) {
        validationErrors.push(`UBO ${index + 1}: Must own at least 25% to be considered a UBO`)
      }
      if (ubo.is_pep) {
        validationErrors.push(`UBO ${index + 1}: Politically Exposed Persons require special approval`)
      }
      if (!ubo.poa_file) {
        validationErrors.push(`UBO ${index + 1}: Power of Attorney is required`)
      }
      if (!ubo.declaration_file) {
        validationErrors.push(`UBO ${index + 1}: Signed declaration is required`)
      }
    })
    
    // Check total UBO percentage
    const totalPercentage = ubos.reduce((sum, u) => sum + u.percentage, 0)
    if (ubos.length > 0 && totalPercentage < 25) {
      validationErrors.push('UBO ownership must represent at least 25% of the company')
    }
    
    // Validate GM signatory
    if (!gmSignatoryName) {
      validationErrors.push('General Manager signatory name is required')
    }
    if (!gmSignatoryEmail) {
      validationErrors.push('General Manager signatory email is required')
    }
    
    if (!termsAccepted) {
      validationErrors.push('You must accept the UBO declaration terms')
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    // Save data
    await updateApplication({
      ubos,
      gm_signatory_name: gmSignatoryName,
      gm_signatory_email: gmSignatoryEmail,
      ubo_terms_accepted: termsAccepted
    }, 'ubos')
    
    router.push(`/application/${params.id}/review`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/members`)
  }
  
  const renderUBOCard = (ubo: UBO) => (
    <Card key={ubo.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Ultimate Beneficial Owner</span>
            <Badge>{ubo.percentage}% Ownership</Badge>
            {ubo.is_pep && <Badge variant="destructive">PEP</Badge>}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRemoveUBO(ubo.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Passport Upload for extraction */}
          <div>
            <Label>Passport (for data extraction)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePassportUpload(file, ubo.id)
                }}
                disabled={extracting === ubo.id}
              />
              {extracting === ubo.id && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
              {ubo.passport_file && <Check className="h-5 w-5 text-green-500" />}
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`name-${ubo.id}`}>Full Name</Label>
              <Input
                id={`name-${ubo.id}`}
                value={ubo.name}
                onChange={(e) => handleUpdateUBO(ubo.id, { name: e.target.value })}
                className={ubo.passport_file ? 'bg-green-50' : ''}
              />
            </div>
            <div>
              <Label htmlFor={`nationality-${ubo.id}`}>Nationality</Label>
              <Input
                id={`nationality-${ubo.id}`}
                value={ubo.nationality}
                onChange={(e) => handleUpdateUBO(ubo.id, { nationality: e.target.value })}
                className={ubo.passport_file ? 'bg-green-50' : ''}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`percentage-${ubo.id}`}>Ownership Percentage</Label>
              <Input
                id={`percentage-${ubo.id}`}
                type="number"
                min="25"
                max="100"
                value={ubo.percentage}
                onChange={(e) => handleUpdateUBO(ubo.id, { percentage: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor={`capacity-${ubo.id}`}>Capacity</Label>
              <Select
                value={ubo.capacity}
                onValueChange={(value) => handleUpdateUBO(ubo.id, { capacity: value })}
              >
                <SelectTrigger id={`capacity-${ubo.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct Shareholder">Direct Shareholder</SelectItem>
                  <SelectItem value="Indirect Shareholder">Indirect Shareholder</SelectItem>
                  <SelectItem value="Controlling Interest">Controlling Interest</SelectItem>
                  <SelectItem value="Trust Beneficiary">Trust Beneficiary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Required Documents */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Required Documents</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`poa-${ubo.id}`} className="text-sm">
                  Power of Attorney {!ubo.poa_file && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={`poa-${ubo.id}`}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleUpdateUBO(ubo.id, { poa_file: e.target.files?.[0] })}
                  className="text-sm"
                />
                {ubo.poa_file && <Check className="h-4 w-4 text-green-500 inline ml-2" />}
              </div>
              
              <div>
                <Label htmlFor={`declaration-${ubo.id}`} className="text-sm">
                  Signed Declaration {!ubo.declaration_file && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={`declaration-${ubo.id}`}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleUpdateUBO(ubo.id, { declaration_file: e.target.files?.[0] })}
                  className="text-sm"
                />
                {ubo.declaration_file && <Check className="h-4 w-4 text-green-500 inline ml-2" />}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`photo-${ubo.id}`} className="text-sm">
                  Passport Photo (Optional)
                </Label>
                <Input
                  id={`photo-${ubo.id}`}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleUpdateUBO(ubo.id, { passport_photo_file: e.target.files?.[0] })}
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`home-id-${ubo.id}`} className="text-sm">
                  Home Country ID (Optional)
                </Label>
                <Input
                  id={`home-id-${ubo.id}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleUpdateUBO(ubo.id, { home_country_id_file: e.target.files?.[0] })}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* PEP Check */}
          <Alert className={ubo.is_pep ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ubo.is_pep}
                  onChange={(e) => handleUpdateUBO(ubo.id, { is_pep: e.target.checked })}
                />
                <span className="text-sm">This person is a Politically Exposed Person (PEP)</span>
              </label>
              {ubo.is_pep && (
                <p className="text-sm text-red-600 mt-2">
                  PEPs require special approval and additional due diligence
                </p>
              )}
            </AlertDescription>
          </Alert>
          
          {/* Special Arrangements */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ubo.special_arrangement}
                onChange={(e) => handleUpdateUBO(ubo.id, { special_arrangement: e.target.checked })}
              />
              <span className="text-sm">Special voting or control arrangements apply</span>
            </label>
            
            {ubo.special_arrangement && (
              <div className="mt-2 space-y-2">
                <Select
                  value={ubo.special_arrangement_type}
                  onValueChange={(value) => handleUpdateUBO(ubo.id, { special_arrangement_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrangement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trust">Trust Structure</SelectItem>
                    <SelectItem value="nominee">Nominee Arrangement</SelectItem>
                    <SelectItem value="voting">Special Voting Rights</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Label className="text-sm">Supporting Documents</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  multiple
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>
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
                <CardTitle>Ultimate Beneficial Owners (UBOs)</CardTitle>
                <CardDescription>
                  Declare all individuals or entities with 25% or more ownership or control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Info Alert */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>UBO Requirements:</strong>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                      <li>Any individual/entity owning 25% or more must be declared</li>
                      <li>Power of Attorney and signed declaration required for each UBO</li>
                      <li>PEPs (Politically Exposed Persons) require special approval</li>
                      <li>All documents must be notarized/apostilled</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                {/* UBO List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Beneficial Owners</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddUBO}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add UBO
                    </Button>
                  </div>
                  
                  {ubos.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        No UBOs declared yet. If any shareholder owns 25% or more, they must be declared as a UBO.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    ubos.map(ubo => renderUBOCard(ubo))
                  )}
                </div>
                
                {/* GM Signatory */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">General Manager Signatory</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="gm-name">Signatory Name</Label>
                      <Input
                        id="gm-name"
                        value={gmSignatoryName}
                        onChange={(e) => setGmSignatoryName(e.target.value)}
                        placeholder="Full name of GM signatory"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gm-email">Signatory Email</Label>
                      <Input
                        id="gm-email"
                        type="email"
                        value={gmSignatoryEmail}
                        onChange={(e) => setGmSignatoryEmail(e.target.value)}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Terms Acceptance */}
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-medium">Declaration & Terms</h3>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2">
                      <Checkbox
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        className="mt-1"
                      />
                      <span className="text-sm">
                        I hereby declare that all information provided regarding the Ultimate Beneficial 
                        Ownership is true, accurate and complete. I understand that providing false information 
                        may result in rejection of the application and potential legal consequences. 
                        I confirm that no UBO is a Politically Exposed Person unless explicitly declared above.
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* Errors */}
                {errors.length > 0 && (
                  <Alert variant="destructive">
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
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={validateAndContinue}>
                    Continue to Review
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
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { PricingBanner } from '@/components/application/PricingBanner'
// import { AuthenticationModal } from '@/components/application/AuthenticationModal' // Not needed - using dedicated pages
import { ArrowLeft, ArrowRight, Info, Calculator } from 'lucide-react'

// Custom hooks for cleaner state management
function useVisaAllocation(visaPackage: number) {
  const [insideCountryVisas, setInsideCountryVisas] = useState(0)
  const [outsideCountryVisas, setOutsideCountryVisas] = useState(0)

  const totalVisasInPackage = visaPackage
  const visasAllocated = insideCountryVisas + outsideCountryVisas
  const visasRemaining = totalVisasInPackage - visasAllocated

  const handleAllocation = (type: 'inside' | 'outside', value: number) => {
    const newValue = Math.max(0, value)
    
    if (type === 'inside') {
      const maxAllowed = totalVisasInPackage - outsideCountryVisas
      setInsideCountryVisas(Math.min(newValue, maxAllowed))
    } else {
      const maxAllowed = totalVisasInPackage - insideCountryVisas
      setOutsideCountryVisas(Math.min(newValue, maxAllowed))
    }
  }

  const setAllInside = () => {
    setInsideCountryVisas(totalVisasInPackage)
    setOutsideCountryVisas(0)
  }

  const setAllOutside = () => {
    setInsideCountryVisas(0)
    setOutsideCountryVisas(totalVisasInPackage)
  }

  const splitEvenly = () => {
    const half = Math.floor(totalVisasInPackage / 2)
    setInsideCountryVisas(half)
    setOutsideCountryVisas(totalVisasInPackage - half)
  }

  return {
    insideCountryVisas,
    outsideCountryVisas,
    totalVisasInPackage,
    visasAllocated,
    visasRemaining,
    handleAllocation,
    setAllInside,
    setAllOutside,
    splitEvenly,
    setInsideCountryVisas,
    setOutsideCountryVisas
  }
}

// Reusable components for better organization
function LicenseConfigurationCard({ 
  licenseValidity, 
  setLicenseValidity, 
  visaPackage, 
  setVisaPackage 
}: {
  licenseValidity: number
  setLicenseValidity: (value: number) => void
  visaPackage: number
  setVisaPackage: (value: number) => void
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="font-lora text-2xl text-gray-900">
          License & Visa Configuration
        </CardTitle>
        <CardDescription className="text-gray-600">
          Choose your license duration and visa requirements. This affects your total cost.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* License Validity */}
        <div className="space-y-3">
          <Label className="font-lora text-lg font-medium text-gray-900">Trade License Validity</Label>
          <RadioGroup
            value={licenseValidity.toString()}
            onValueChange={(value) => setLicenseValidity(parseInt(value))}
          >
            {[1, 2, 3, 4, 5].map((years) => (
              <div key={years} className="flex items-center space-x-2">
                <RadioGroupItem value={years.toString()} id={`years-${years}`} />
                <Label htmlFor={`years-${years}`} className="font-normal cursor-pointer">
                  {years} {years === 1 ? 'Year' : 'Years'}
                  {years === 2 && <span className="text-sm text-gray-500 ml-2">(Recommended - aligns with 2-year visa validity)</span>}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {/* Visa Package */}
        <div className="space-y-3">
          <Label htmlFor="visa-package" className="font-lora text-lg font-medium text-gray-900">Visa Package</Label>
          <Select
            value={visaPackage.toString()}
            onValueChange={(value) => setVisaPackage(parseInt(value))}
          >
            <SelectTrigger id="visa-package">
              <SelectValue placeholder="Select visa package" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No Visas (License Only)</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Visa{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {visaPackage > 0 && (
            <Alert className="mt-3">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You have {visaPackage} visa{visaPackage > 1 ? 's' : ''} in your package. 
                Please allocate them below between inside and outside UAE processing.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function VisaAllocationCard({ 
  visaPackage,
  visaAllocation,
  establishmentCard,
  setEstablishmentCard
}: {
  visaPackage: number
  visaAllocation: ReturnType<typeof useVisaAllocation>
  establishmentCard: boolean
  setEstablishmentCard: (value: boolean) => void
}) {
  const {
    insideCountryVisas,
    outsideCountryVisas,
    setAllInside,
    setAllOutside
  } = visaAllocation

  if (visaPackage === 0) return null

  // Determine current selection
  const isInsideSelected = insideCountryVisas === visaPackage && outsideCountryVisas === 0
  const isOutsideSelected = outsideCountryVisas === visaPackage && insideCountryVisas === 0
  const hasSelection = isInsideSelected || isOutsideSelected

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="font-lora text-2xl text-gray-900">
          Visa Processing Location
        </CardTitle>
        <CardDescription className="text-gray-600">
          Where will you be applying for your {visaPackage} visa{visaPackage > 1 ? 's' : ''}? 
          <span className="text-sm text-gray-500 block mt-1">This can be changed later if needed.</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inside UAE Option */}
          <div 
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
              isInsideSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={setAllInside}
          >
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full border-2 mx-auto mb-3 flex items-center justify-center ${
                isInsideSelected 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
              }`}>
                {isInsideSelected && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <h4 className="font-lora text-lg font-medium text-gray-900 mb-2">
                Inside UAE
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                You are currently in the UAE and will apply from here
              </p>
              <div className="text-xs text-gray-500">
                • Faster processing
                • No embassy requirements
                • Local document submission
              </div>
            </div>
          </div>
          
          {/* Outside UAE Option */}
          <div 
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
              isOutsideSelected 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={setAllOutside}
          >
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full border-2 mx-auto mb-3 flex items-center justify-center ${
                isOutsideSelected 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-gray-300'
              }`}>
                {isOutsideSelected && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <h4 className="font-lora text-lg font-medium text-gray-900 mb-2">
                Outside UAE
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                You are outside the UAE and will apply through embassy/consulate
              </p>
              <div className="text-xs text-gray-500">
                • Embassy processing
                • Document attestation required
                • Longer processing time
              </div>
            </div>
          </div>
        </div>

        {!hasSelection && (
          <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-700 text-sm">
              Please select where you'll be applying for your visa{visaPackage > 1 ? 's' : ''}
            </p>
          </div>
        )}
        
        {/* Establishment Card */}
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Checkbox
            id="establishment"
            checked={establishmentCard}
            disabled={visaPackage > 0}
            onCheckedChange={(checked) => setEstablishmentCard(checked as boolean)}
          />
          <Label htmlFor="establishment" className="text-sm">
            Include Establishment Card
            {visaPackage > 0 && <span className="text-gray-500 ml-1">(Required with visas)</span>}
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LicenseVisasPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress, loadApplication } = useApplication()
  
  const [licenseValidity, setLicenseValidity] = useState(applicationData.trade_license_validity || 2)
  const [visaPackage, setVisaPackage] = useState(applicationData.visa_package || 0)
  const [requirePartnerVisa, setRequirePartnerVisa] = useState(
    applicationData.require_investor_or_partner_visa || 'No'
  )
  const [partnerVisaCount, setPartnerVisaCount] = useState(applicationData.partner_visa_count || 0)
  const [establishmentCard, setEstablishmentCard] = useState(
    applicationData.establishment_card !== undefined ? applicationData.establishment_card : false
  )
  const [errors, setErrors] = useState<string[]>([])
  
  // Use the custom hook for visa allocation
  const visaAllocation = useVisaAllocation(visaPackage)
  
  // Initialize visa allocation from application data
  useEffect(() => {
    if (applicationData.inside_country_visas !== undefined) {
      visaAllocation.setInsideCountryVisas(applicationData.inside_country_visas)
    }
    if (applicationData.outside_country_visas !== undefined) {
      visaAllocation.setOutsideCountryVisas(applicationData.outside_country_visas)
    }
  }, [applicationData.inside_country_visas, applicationData.outside_country_visas])
  
  useEffect(() => {
    // Load application if not already loaded
    if (!applicationData.id && params.id) {
      loadApplication(params.id)
    }
    updateProgress(1, 'license')
  }, [params.id])
  
  // Auto-calculate visas in quotation based on package
  useEffect(() => {
    // Establishment card is required if visas > 0
    if (visaPackage > 0) {
      setEstablishmentCard(true)
    }
  }, [visaPackage])
  
  
  const validateAndContinue = async () => {
    const validationErrors = []
    
    // Validate visa allocation
    if (visaPackage > 0) {
      const isInsideSelected = visaAllocation.insideCountryVisas === visaPackage && visaAllocation.outsideCountryVisas === 0
      const isOutsideSelected = visaAllocation.outsideCountryVisas === visaPackage && visaAllocation.insideCountryVisas === 0
      
      if (!isInsideSelected && !isOutsideSelected) {
        validationErrors.push('Please select where you will be applying for your visas (inside or outside UAE)')
      }
      
      if (!establishmentCard) {
        validationErrors.push('Establishment card is required when visas are included')
      }
    }
    
    // Validate partner visa
    if (requirePartnerVisa === 'Partner' && partnerVisaCount === 0) {
      validationErrors.push('Please specify the number of partner visas required')
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    // Save data
    await updateApplication({
      trade_license_validity: licenseValidity,
      visa_package: visaPackage,
      require_investor_or_partner_visa: requirePartnerVisa,
      partner_visa_count: requirePartnerVisa === 'Partner' ? partnerVisaCount : 0,
      inside_country_visas: visaAllocation.insideCountryVisas,
      outside_country_visas: visaAllocation.outsideCountryVisas,
      establishment_card: establishmentCard
    }, 'license')
    
    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('auth_token')
    
    if (!isAuthenticated) {
      // Navigate to sign-up page in the flow
      router.push(`/application/${params.id}/signup`)
    } else {
      // Continue to next step (user already authenticated)
      router.push(`/application/${params.id}/activities`)
    }
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/start`)
  }
  
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-lora text-3xl font-bold text-gray-900">Company Formation Application</h1>
          <p className="text-gray-600 mt-2">Configure your license and visa requirements</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* License & Visa Configuration Card */}
            <LicenseConfigurationCard 
              licenseValidity={licenseValidity}
              setLicenseValidity={setLicenseValidity}
              visaPackage={visaPackage}
              setVisaPackage={setVisaPackage}
            />
            
            {/* Visa Allocation Card - Separate and Simplified */}
            <VisaAllocationCard 
              visaPackage={visaPackage}
              visaAllocation={visaAllocation}
              establishmentCard={establishmentCard}
              setEstablishmentCard={setEstablishmentCard}
            />
                
            {/* Partner/Investor Visa Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-lora text-2xl text-gray-900">
                  Additional Visa Requirements
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Do you need additional investor or partner visas beyond your main package?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="font-lora text-lg font-medium text-gray-900">Investor or Partner Visas</Label>
                  <RadioGroup
                    value={requirePartnerVisa}
                    onValueChange={setRequirePartnerVisa}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="no-partner" />
                      <Label htmlFor="no-partner" className="font-normal cursor-pointer">
                        No additional partner/investor visas needed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Investor" id="investor" />
                      <Label htmlFor="investor" className="font-normal cursor-pointer">
                        Investor Visa (for company owner)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Partner" id="partner" />
                      <Label htmlFor="partner" className="font-normal cursor-pointer">
                        Partner Visa (for business partners)
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {requirePartnerVisa === 'Partner' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <Label htmlFor="partner-count" className="font-medium">Number of Partner Visas</Label>
                      <Select
                        value={partnerVisaCount.toString()}
                        onValueChange={(value) => setPartnerVisaCount(parseInt(value))}
                      >
                        <SelectTrigger id="partner-count" className="mt-2">
                          <SelectValue placeholder="Select number of partner visas" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Partner Visa{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Alert className="mt-3">
                        <Calculator className="h-4 w-4" />
                        <AlertDescription>
                          Partner visas require minimum AED 48,000 share capital per partner
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
                
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
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack} className="px-6 py-3">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
              <Button onClick={validateAndContinue} className="px-6 py-3 bg-brand hover:bg-brand-600">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
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

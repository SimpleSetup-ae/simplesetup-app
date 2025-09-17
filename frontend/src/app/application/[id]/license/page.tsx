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
import { AuthenticationModal } from '@/components/application/AuthenticationModal'
import { ArrowLeft, ArrowRight, Info, Calculator } from 'lucide-react'

export default function LicenseVisasPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress, loadApplication } = useApplication()
  
  const [licenseValidity, setLicenseValidity] = useState(applicationData.trade_license_validity || 2)
  const [visaPackage, setVisaPackage] = useState(applicationData.visa_package || 0)
  const [requirePartnerVisa, setRequirePartnerVisa] = useState(
    applicationData.require_investor_or_partner_visa || 'No'
  )
  const [partnerVisaCount, setPartnerVisaCount] = useState(applicationData.partner_visa_count || 0)
  const [insideCountryVisas, setInsideCountryVisas] = useState(applicationData.inside_country_visas || 0)
  const [outsideCountryVisas, setOutsideCountryVisas] = useState(applicationData.outside_country_visas || 0)
  const [establishmentCard, setEstablishmentCard] = useState(
    applicationData.establishment_card !== undefined ? applicationData.establishment_card : false
  )
  const [errors, setErrors] = useState<string[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  
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
  
  // Calculate visa allocation
  const totalVisasInPackage = visaPackage
  const visasAllocated = insideCountryVisas + outsideCountryVisas
  const visasRemaining = totalVisasInPackage - visasAllocated
  
  const handleVisaAllocationChange = (type: 'inside' | 'outside', value: number) => {
    const newValue = Math.max(0, value)
    
    if (type === 'inside') {
      const maxAllowed = totalVisasInPackage - outsideCountryVisas
      setInsideCountryVisas(Math.min(newValue, maxAllowed))
    } else {
      const maxAllowed = totalVisasInPackage - insideCountryVisas
      setOutsideCountryVisas(Math.min(newValue, maxAllowed))
    }
  }
  
  const validateAndContinue = async () => {
    const validationErrors = []
    
    // Validate visa allocation
    if (visaPackage > 0) {
      if (visasAllocated !== totalVisasInPackage) {
        validationErrors.push(`Please allocate all ${totalVisasInPackage} visas (${visasRemaining} remaining)`)
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
      inside_country_visas: insideCountryVisas,
      outside_country_visas: outsideCountryVisas,
      establishment_card: establishmentCard
    }, 'license')
    
    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('auth_token')
    
    if (!isAuthenticated) {
      // Show authentication modal
      setShowAuthModal(true)
    } else {
      // Continue to next step
      router.push(`/application/${params.id}/activities`)
    }
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/start`)
  }
  
  const handleAuthSuccess = (user: any) => {
    // Authentication successful, continue to next step
    setShowAuthModal(false)
    router.push(`/application/${params.id}/activities`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Company Formation Application</h1>
            <span className="text-sm text-gray-500">Step 2 of 8</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>License & Visa Configuration</CardTitle>
                <CardDescription>
                  Choose your license duration and visa requirements. This affects your total cost.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* License Validity */}
                <div className="space-y-3">
                  <Label>Trade License Validity</Label>
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
                  <Label htmlFor="visa-package">Visa Package</Label>
                  <Select
                    value={visaPackage.toString()}
                    onValueChange={(value) => setVisaPackage(parseInt(value))}
                  >
                    <SelectTrigger id="visa-package">
                      <SelectValue placeholder="Select visa package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Visas (License Only)</SelectItem>
                      <SelectItem value="1">1 Visa</SelectItem>
                      <SelectItem value="2">2 Visas</SelectItem>
                      <SelectItem value="3">3 Visas</SelectItem>
                      <SelectItem value="4">4 Visas</SelectItem>
                      <SelectItem value="5">5 Visas</SelectItem>
                      <SelectItem value="6">6 Visas</SelectItem>
                      <SelectItem value="7">7 Visas</SelectItem>
                      <SelectItem value="8">8 Visas</SelectItem>
                      <SelectItem value="9">9 Visas</SelectItem>
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
                
                {/* Visa Allocation */}
                {visaPackage > 0 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Visa Processing Allocation</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Allocate your {visaPackage} visa{visaPackage > 1 ? 's' : ''} between inside and outside UAE processing
                        </p>
                      </div>
                      
                      {/* Allocation Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-900">Total Visas in Package:</span>
                          <span className="text-lg font-bold text-blue-900">{totalVisasInPackage}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-blue-700">Allocated:</span>
                          <span className="text-sm font-medium text-blue-700">{visasAllocated}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">Remaining:</span>
                          <span className={`text-sm font-medium ${
                            visasRemaining > 0 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {visasRemaining}
                          </span>
                        </div>
                        {visasRemaining > 0 && (
                          <div className="mt-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1">
                            ⚠️ Please allocate all {visasRemaining} remaining visa{visasRemaining > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      {/* Allocation Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-2 hover:border-blue-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <Label htmlFor="inside-visas" className="text-sm font-medium text-gray-900">
                                  Inside UAE Processing
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                  For people already in UAE
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{insideCountryVisas}</div>
                                <div className="text-xs text-gray-500">visa{insideCountryVisas !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleVisaAllocationChange('inside', insideCountryVisas - 1)}
                                disabled={insideCountryVisas === 0}
                                className="w-8 h-8 p-0"
                              >
                                -
                              </Button>
                              <input
                                id="inside-visas"
                                type="number"
                                min="0"
                                max={visaPackage}
                                value={insideCountryVisas}
                                onChange={(e) => handleVisaAllocationChange('inside', parseInt(e.target.value) || 0)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleVisaAllocationChange('inside', insideCountryVisas + 1)}
                                disabled={visasRemaining === 0}
                                className="w-8 h-8 p-0"
                              >
                                +
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-2 hover:border-green-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <Label htmlFor="outside-visas" className="text-sm font-medium text-gray-900">
                                  Outside UAE Processing
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                  For people outside UAE
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">{outsideCountryVisas}</div>
                                <div className="text-xs text-gray-500">visa{outsideCountryVisas !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleVisaAllocationChange('outside', outsideCountryVisas - 1)}
                                disabled={outsideCountryVisas === 0}
                                className="w-8 h-8 p-0"
                              >
                                -
                              </Button>
                              <input
                                id="outside-visas"
                                type="number"
                                min="0"
                                max={visaPackage}
                                value={outsideCountryVisas}
                                onChange={(e) => handleVisaAllocationChange('outside', parseInt(e.target.value) || 0)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-center font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleVisaAllocationChange('outside', outsideCountryVisas + 1)}
                                disabled={visasRemaining === 0}
                                className="w-8 h-8 p-0"
                              >
                                +
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Quick Allocation Buttons */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInsideCountryVisas(totalVisasInPackage)
                            setOutsideCountryVisas(0)
                          }}
                          className="text-xs"
                        >
                          All Inside UAE
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInsideCountryVisas(0)
                            setOutsideCountryVisas(totalVisasInPackage)
                          }}
                          className="text-xs"
                        >
                          All Outside UAE
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const half = Math.floor(totalVisasInPackage / 2)
                            setInsideCountryVisas(half)
                            setOutsideCountryVisas(totalVisasInPackage - half)
                          }}
                          className="text-xs"
                        >
                          Split Evenly
                        </Button>
                      </div>
                      
                      {visasAllocated > totalVisasInPackage && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            ⚠️ You've allocated more visas than available in your package. Please adjust the allocation.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    {/* Establishment Card */}
                    <div className="flex items-center space-x-2">
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
                  </>
                )}
                
                {/* Partner/Investor Visa */}
                <div className="space-y-3">
                  <Label>Do you require Investor or Partner Visas?</Label>
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
                    <div className="mt-3">
                      <Label htmlFor="partner-count">Number of Partner Visas</Label>
                      <Select
                        value={partnerVisaCount.toString()}
                        onValueChange={(value) => setPartnerVisaCount(parseInt(value))}
                      >
                        <SelectTrigger id="partner-count">
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
                      <Alert className="mt-2">
                        <Calculator className="h-4 w-4" />
                        <AlertDescription>
                          Partner visas require minimum AED 48,000 share capital per partner
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
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
      
      {/* Authentication Modal */}
      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        draftToken={applicationData.draft_token}
      />
    </div>
  )
}

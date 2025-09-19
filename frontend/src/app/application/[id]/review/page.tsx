'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PricingBanner } from '@/components/application/PricingBanner'
import { 
  ArrowLeft, Check, CheckCircle, AlertCircle, 
  Building, Users, FileText, DollarSign, Loader2
} from 'lucide-react'

interface SectionStatus {
  complete: boolean
  errors: string[]
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateProgress, submitApplication } = useApplication()
  
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [finalConfirmation, setFinalConfirmation] = useState(false)
  const [dataAccuracy, setDataAccuracy] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  useEffect(() => {
    updateProgress(7, 'review')
  }, [])
  
  // Validate sections
  const validateSections = (): Record<string, SectionStatus> => {
    const sections: Record<string, SectionStatus> = {
      license: {
        complete: !!(applicationData.trade_license_validity && applicationData.visa_package !== undefined),
        errors: []
      },
      activities: {
        complete: !!(applicationData.business_activities && applicationData.business_activities.length > 0),
        errors: []
      },
      names: {
        complete: !!(applicationData.name_options && applicationData.name_options.length > 0),
        errors: []
      },
      shareholding: {
        complete: !!(applicationData.share_capital && applicationData.share_value),
        errors: []
      },
      members: {
        complete: !!(applicationData.shareholders && applicationData.shareholders.length > 0 && 
                    applicationData.general_manager),
        errors: []
      },
      ubos: {
        complete: (() => {
          const shareholdingType = applicationData.shareholding_type
          const requiresUBO = shareholdingType === 'corporate' || shareholdingType === 'mixed'
          
          if (!requiresUBO) {
            return true // UBOs not required, so consider it complete
          }
          
          return !!(applicationData.gm_signatory_name && applicationData.ubo_terms_accepted)
        })(),
        errors: []
      }
    }
    
    // Add specific validation errors
    if (!sections.license.complete) {
      sections.license.errors.push('License configuration incomplete')
    }
    
    if (!sections.activities.complete) {
      sections.activities.errors.push('No business activities selected')
    }
    
    if (!sections.names.complete) {
      sections.names.errors.push('No company names provided')
    }
    
    if (applicationData.shareholders) {
      const totalShares = applicationData.shareholders.reduce((sum: number, s: any) => sum + (s.share_percentage || 0), 0)
      if (totalShares !== 100) {
        sections.members.errors.push(`Total shareholding is ${totalShares}%, must equal 100%`)
      }
    }
    
    return sections
  }
  
  const sections = validateSections()
  const allSectionsComplete = Object.values(sections).every(s => s.complete && s.errors.length === 0)
  
  const handleSubmit = async () => {
    const validationErrors = []
    
    if (!allSectionsComplete) {
      validationErrors.push('Please complete all sections before submitting')
    }
    
    if (!finalConfirmation) {
      validationErrors.push('Please confirm you are ready to submit')
    }
    
    if (!dataAccuracy) {
      validationErrors.push('Please confirm all information is accurate')
    }
    
    if (!termsAccepted) {
      validationErrors.push('Please accept the terms and conditions')
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setSubmitting(true)
    setErrors([])
    
    const result = await submitApplication()
    
    if (result.success) {
      router.push(`/application/${params.id}/success`)
    } else {
      setErrors(result.errors || ['Submission failed. Please try again.'])
      setSubmitting(false)
    }
  }
  
  const handleEdit = (section: string) => {
    router.push(`/application/${params.id}/${section}`)
  }
  
  const renderSection = (
    title: string,
    section: string,
    status: SectionStatus,
    content: React.ReactNode
  ) => (
    <Card className={`${!status.complete ? 'border-orange-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {status.complete ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => handleEdit(section)}>
            Edit
          </Button>
        </div>
        {status.errors.length > 0 && (
          <div className="mt-2">
            {status.errors.map((error, i) => (
              <p key={i} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Application</h1>
          <p className="text-gray-600">Please review all information before submitting</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* License & Visas */}
            {renderSection(
              'License & Visa Configuration',
              'license',
              sections.license,
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">License Validity:</span>
                  <span className="font-medium">{applicationData.trade_license_validity} Year(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visa Package:</span>
                  <span className="font-medium">{applicationData.visa_package} Visa(s)</span>
                </div>
                {(applicationData.visa_package || 0) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inside UAE:</span>
                      <span className="font-medium">{applicationData.inside_country_visas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Outside UAE:</span>
                      <span className="font-medium">{applicationData.outside_country_visas}</span>
                    </div>
                  </>
                )}
                {(applicationData.partner_visa_count || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Partner Visas:</span>
                    <span className="font-medium">{applicationData.partner_visa_count}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Business Activities */}
            {renderSection(
              'Business Activities',
              'activities',
              sections.activities,
              <div className="space-y-2">
                {applicationData.business_activities?.map((activity: any, index: number) => (
                  <div key={activity.activity_id} className="flex items-center justify-between">
                    <span className="text-sm">{activity.activity_name}</span>
                    <div className="flex gap-2">
                      {activity.is_main && <Badge className="text-xs">Main</Badge>}
                      {index < 3 && <Badge variant="secondary" className="text-xs">Free</Badge>}
                    </div>
                  </div>
                ))}
                {applicationData.request_custom_activity && (
                  <p className="text-sm text-orange-600 mt-2">
                    Custom activity requested (pending approval)
                  </p>
                )}
              </div>
            )}
            
            {/* Company Names */}
            {renderSection(
              'Company Names',
              'names',
              sections.names,
              <div className="space-y-2">
                {applicationData.name_options?.map((name: string, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{name}</span>
                    {index === 0 && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                  </div>
                ))}
                {applicationData.name_arabic && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-gray-600">Arabic: </span>
                    <span className="text-sm font-arabic" dir="rtl">{applicationData.name_arabic}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Shareholding */}
            {renderSection(
              'Share Structure',
              'shareholding',
              sections.shareholding,
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Share Capital:</span>
                  <span className="font-medium">AED {applicationData.share_capital?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Share Value:</span>
                  <span className="font-medium">AED {applicationData.share_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Shares:</span>
                  <span className="font-medium">{applicationData.total_shares?.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            {/* Members */}
            {renderSection(
              'Company Members',
              'members',
              sections.members,
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Shareholders ({applicationData.shareholders?.length || 0})</p>
                  {applicationData.shareholders?.map((s: any) => (
                    <div key={s.id} className="text-sm flex justify-between">
                      <span>{s.first_name} {s.last_name} {s.company_name}</span>
                      <Badge variant="outline" className="text-xs">{s.share_percentage}%</Badge>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">General Manager {applicationData.general_manager ? '(1)' : '(0)'}</p>
                  {applicationData.general_manager && (
                    <div className="text-sm">
                      {applicationData.general_manager.first_name} {applicationData.general_manager.last_name} {applicationData.general_manager.company_name}
                    </div>
                  )}
                  {!applicationData.general_manager && (
                    <div className="text-sm text-gray-500">No General Manager selected</div>
                  )}
                </div>
              </div>
            )}
            
            {/* UBOs - Only show if shareholding type requires UBOs */}
            {(() => {
              const shareholdingType = applicationData.shareholding_type
              const requiresUBO = shareholdingType === 'corporate' || shareholdingType === 'mixed'
              
              if (!requiresUBO) {
                return null // Don't show UBO section if not required by shareholding type
              }
              
              return renderSection(
                'Ultimate Beneficial Owners',
                'ubos',
                sections.ubos,
                <div className="space-y-2">
                  {applicationData.ubos && applicationData.ubos.length > 0 ? (
                    applicationData.ubos.map((ubo: any) => (
                      <div key={ubo.id} className="text-sm flex justify-between">
                        <span>{ubo.name}</span>
                        <Badge variant="outline" className="text-xs">{ubo.percentage}%</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No UBOs declared for corporate shareholders</p>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">GM Signatory: {applicationData.gm_signatory_name}</p>
                  </div>
                </div>
              )
            })()}
            
            {/* Final Confirmation */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Final Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-start gap-2">
                  <Checkbox
                    checked={finalConfirmation}
                    onCheckedChange={(checked) => setFinalConfirmation(checked as boolean)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I confirm that I have reviewed all information and I am ready to submit this application
                  </span>
                </label>
                
                <label className="flex items-start gap-2">
                  <Checkbox
                    checked={dataAccuracy}
                    onCheckedChange={(checked) => setDataAccuracy(checked as boolean)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I certify that all information provided is true, accurate and complete to the best of my knowledge
                  </span>
                </label>
                
                <label className="flex items-start gap-2">
                  <Checkbox
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I accept the terms and conditions and understand that false information may result in rejection
                  </span>
                </label>
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
            
            {/* Submit Section */}
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Go back to UBOs if there are corporate shareholders, otherwise go to members
                  const hasCorporateShareholders = applicationData.shareholders?.some((s: any) => s.type === 'Corporate')
                  const previousPage = hasCorporateShareholders ? 'ubos' : 'members'
                  router.push(`/application/${params.id}/${previousPage}`)
                }}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button 
                size="lg"
                onClick={handleSubmit}
                disabled={submitting || !allSectionsComplete}
                className="px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Pricing Summary */}
          <div className="lg:col-span-1">
            <PricingBanner />
            
            {/* Completion Status */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(sections).map(([key, status]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key}</span>
                      {status.complete ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  ))}
                </div>
                
                {allSectionsComplete ? (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Application ready for submission
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please complete all sections
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

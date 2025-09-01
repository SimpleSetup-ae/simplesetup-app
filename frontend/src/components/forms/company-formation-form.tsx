'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FREE_ZONES } from '@simple-setup/shared'

export default function CompanyFormationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    trade_name: '',
    free_zone: 'IFZA',
    business_activity: '',
    business_description: '',
    shareholders: [{ full_name: '', nationality: '', passport_number: '', share_percentage: 100 }],
    directors: [{ full_name: '', nationality: '', passport_number: '' }]
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayFieldChange = (arrayField: string, index: number, field: string, value: any) => {
    setFormData(prev => {
      const currentArray = prev[arrayField as keyof typeof prev] as any[]
      return {
        ...prev,
        [arrayField]: currentArray.map((item: any, i: number) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    })
  }

  const addArrayItem = (arrayField: string, template: any) => {
    setFormData(prev => {
      const currentArray = prev[arrayField as keyof typeof prev] as any[]
      return {
        ...prev,
        [arrayField]: [...currentArray, template]
      }
    })
  }

  const removeArrayItem = (arrayField: string, index: number) => {
    setFormData(prev => {
      const currentArray = prev[arrayField as keyof typeof prev] as any[]
      return {
        ...prev,
        [arrayField]: currentArray.filter((_: any, i: number) => i !== index)
      }
    })
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // This would submit to the backend API
    console.log('Submitting company formation:', formData)
    
    // Mock API call
    alert('Company formation submitted! (This would integrate with the backend API)')
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Formation Progress</CardTitle>
          <CardDescription>Complete all steps to start your company formation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep ? 'bg-orange-500 text-white' :
                  step < currentStep ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && <div className="w-16 h-1 bg-gray-200 mx-2"></div>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Company Info</span>
            <span>People</span>
            <span>Review</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Company Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Company Information</CardTitle>
            <CardDescription>Provide basic company details and business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Proposed Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trade_name">Trade Name</Label>
                <Input
                  id="trade_name"
                  value={formData.trade_name}
                  onChange={(e) => handleInputChange('trade_name', e.target.value)}
                  placeholder="If different from company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="free_zone">Free Zone *</Label>
                <select
                  id="free_zone"
                  value={formData.free_zone}
                  onChange={(e) => handleInputChange('free_zone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {Object.entries(FREE_ZONES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_activity">Primary Business Activity *</Label>
                <select
                  id="business_activity"
                  value={formData.business_activity}
                  onChange={(e) => handleInputChange('business_activity', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select an activity</option>
                  <option value="Trading">Trading</option>
                  <option value="Consulting">Consulting</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Import/Export">Import/Export</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_description">Business Description *</Label>
              <textarea
                id="business_description"
                value={formData.business_description}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                placeholder="Provide a detailed description of your business activities (minimum 50 characters)"
                className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
              />
              <p className="text-xs text-gray-500">
                {formData.business_description.length}/500 characters
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={nextStep} disabled={!formData.name || !formData.business_activity || formData.business_description.length < 50}>
                Next: Shareholder Information
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Shareholders & Directors */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Shareholder & Director Information</CardTitle>
            <CardDescription>Provide details of company shareholders and directors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Shareholders */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Shareholders</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => addArrayItem('shareholders', { full_name: '', nationality: '', passport_number: '', share_percentage: 0 })}
                >
                  Add Shareholder
                </Button>
              </div>
              
              {formData.shareholders.map((shareholder, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={shareholder.full_name}
                          onChange={(e) => handleArrayFieldChange('shareholders', index, 'full_name', e.target.value)}
                          placeholder="Full name as in passport"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nationality *</Label>
                        <Input
                          value={shareholder.nationality}
                          onChange={(e) => handleArrayFieldChange('shareholders', index, 'nationality', e.target.value)}
                          placeholder="Nationality"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Passport Number *</Label>
                        <Input
                          value={shareholder.passport_number}
                          onChange={(e) => handleArrayFieldChange('shareholders', index, 'passport_number', e.target.value)}
                          placeholder="Passport number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Share % *</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={shareholder.share_percentage}
                            onChange={(e) => handleArrayFieldChange('shareholders', index, 'share_percentage', parseInt(e.target.value))}
                            placeholder="Share %"
                          />
                          {formData.shareholders.length > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeArrayItem('shareholders', index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <p className="text-sm text-gray-600">
                Total shareholding: {formData.shareholders.reduce((sum, s) => sum + (s.share_percentage || 0), 0)}%
              </p>
            </div>

            {/* Directors */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Directors</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => addArrayItem('directors', { full_name: '', nationality: '', passport_number: '' })}
                >
                  Add Director
                </Button>
              </div>
              
              {formData.directors.map((director, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={director.full_name}
                          onChange={(e) => handleArrayFieldChange('directors', index, 'full_name', e.target.value)}
                          placeholder="Full name as in passport"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nationality *</Label>
                        <Input
                          value={director.nationality}
                          onChange={(e) => handleArrayFieldChange('directors', index, 'nationality', e.target.value)}
                          placeholder="Nationality"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Passport Number *</Label>
                        <div className="flex gap-2">
                          <Input
                            value={director.passport_number}
                            onChange={(e) => handleArrayFieldChange('directors', index, 'passport_number', e.target.value)}
                            placeholder="Passport number"
                          />
                          {formData.directors.length > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeArrayItem('directors', index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous: Company Information
              </Button>
              <Button onClick={nextStep}>
                Next: Review & Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Review & Submit</CardTitle>
            <CardDescription>Review your information and submit the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Information Review */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Company Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Company Name:</strong> {formData.name}</p>
                {formData.trade_name && <p><strong>Trade Name:</strong> {formData.trade_name}</p>}
                <p><strong>Free Zone:</strong> {FREE_ZONES[formData.free_zone as keyof typeof FREE_ZONES]}</p>
                <p><strong>Business Activity:</strong> {formData.business_activity}</p>
                <p><strong>Description:</strong> {formData.business_description}</p>
              </div>
            </div>

            {/* Shareholders Review */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Shareholders</h3>
              <div className="space-y-3">
                {formData.shareholders.map((shareholder, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>{shareholder.full_name}</strong> ({shareholder.nationality})</p>
                    <p>Passport: {shareholder.passport_number} • Share: {shareholder.share_percentage}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Directors Review */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Directors</h3>
              <div className="space-y-3">
                {formData.directors.map((director, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>{director.full_name}</strong> ({director.nationality})</p>
                    <p>Passport: {director.passport_number}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Next Steps After Submission:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Document upload (passports, utility bills, NOC letters)</li>
                <li>• Application review by CSP team</li>
                <li>• Payment processing (Government fee: 2,500 AED + Service fee: 500 AED)</li>
                <li>• Automated IFZA portal submission</li>
                <li>• License issuance and delivery</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous: Shareholders & Directors
              </Button>
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

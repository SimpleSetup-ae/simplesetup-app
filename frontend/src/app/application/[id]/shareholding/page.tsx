'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { PricingBanner } from '@/components/application/PricingBanner'
import { ArrowLeft, ArrowRight, Info, Calculator, AlertCircle, Upload } from 'lucide-react'

export default function ShareholdingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress } = useApplication()
  
  const [shareholdingType, setShareholdingType] = useState(
    applicationData.shareholding_type || 'individual'
  )
  const [shareholderCount, setShareholderCount] = useState(2)
  const [shareCapital, setShareCapital] = useState(
    applicationData.share_capital || 150000
  )
  const [shareValue, setShareValue] = useState(
    applicationData.share_value || 10
  )
  const [totalShares, setTotalShares] = useState(
    applicationData.total_shares || 15000
  )
  const [votingProportional, setVotingProportional] = useState(
    applicationData.voting_rights_proportional !== false
  )
  const [votingNotes, setVotingNotes] = useState(
    applicationData.voting_rights_notes || ''
  )
  const [bankLetterFile, setBankLetterFile] = useState<File | null>(null)
  const [shareholdersAgreementFile, setShareholdersAgreementFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  
  // Partner visa requirement from license step
  const partnerVisaCount = applicationData.partner_visa_count || 0
  const requiredCapitalForPartnerVisa = partnerVisaCount * 48000
  
  useEffect(() => {
    updateProgress(4, 'shareholding')
  }, [])
  
  // Calculate total shares based on capital and share value
  useEffect(() => {
    if (shareCapital && shareValue) {
      setTotalShares(Math.floor(shareCapital / shareValue))
    }
  }, [shareCapital, shareValue])
  
  const validateAndContinue = async () => {
    const validationErrors = []
    
    // Check share capital
    if (shareCapital < 1000) {
      validationErrors.push('Minimum share capital is AED 1,000')
    }
    
    if (shareCapital > 10000000) {
      validationErrors.push('Maximum share capital is AED 10,000,000')
    }
    
    // Check partner visa requirement
    if (partnerVisaCount > 0 && shareCapital < requiredCapitalForPartnerVisa) {
      validationErrors.push(
        `Partner visa requires minimum AED ${requiredCapitalForPartnerVisa.toLocaleString()} share capital ` +
        `(AED 48,000 × ${partnerVisaCount} partner visas)`
      )
    }
    
    // Check bank letter requirement
    if (shareCapital > 150000 && !bankLetterFile) {
      validationErrors.push('Bank letter is required for share capital above AED 150,000')
    }
    
    // Check share value
    if (shareValue < 10) {
      validationErrors.push('Minimum share value is AED 10')
    }
    
    // Check voting rights
    if (!votingProportional && !votingNotes) {
      validationErrors.push('Please explain non-proportional voting rights arrangement')
    }
    
    if (!votingProportional && !shareholdersAgreementFile) {
      validationErrors.push('Shareholders agreement required for non-proportional voting rights')
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    // Upload files if present
    if (bankLetterFile) {
      const formData = new FormData()
      formData.append('file', bankLetterFile)
      formData.append('document_type', 'bank_letter')
      formData.append('document_category', 'financial')
      
      await fetch(`/api/v1/applications/${params.id}/documents`, {
        method: 'POST',
        body: formData
      })
    }
    
    if (shareholdersAgreementFile) {
      const formData = new FormData()
      formData.append('file', shareholdersAgreementFile)
      formData.append('document_type', 'shareholders_agreement')
      formData.append('document_category', 'corporate')
      
      await fetch(`/api/v1/applications/${params.id}/documents`, {
        method: 'POST',
        body: formData
      })
    }
    
    // Save data
    await updateApplication({
      shareholding_type: shareholdingType,
      share_capital: shareCapital,
      share_value: shareValue,
      total_shares: totalShares,
      voting_rights_proportional: votingProportional,
      voting_rights_notes: votingNotes
    }, 'shareholding')
    
    router.push(`/application/${params.id}/members`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/names`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share Capital & Ownership Structure</CardTitle>
                <CardDescription>
                  Define your company's shareholding structure and capital requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Shareholding Type */}
                <div className="space-y-3">
                  <Label>Shareholding Type</Label>
                  <RadioGroup
                    value={shareholdingType}
                    onValueChange={setShareholdingType}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="font-normal cursor-pointer">
                        Individual Shareholders Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="corporate" id="corporate" />
                      <Label htmlFor="corporate" className="font-normal cursor-pointer">
                        Corporate Shareholders Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed" className="font-normal cursor-pointer">
                        Mixed (Individual & Corporate)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Number of Shareholders */}
                <div className="space-y-2">
                  <Label htmlFor="shareholder-count">Number of Shareholders</Label>
                  <Input
                    id="shareholder-count"
                    type="number"
                    min="1"
                    max="50"
                    value={shareholderCount}
                    onChange={(e) => setShareholderCount(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-sm text-gray-500">
                    You can have between 1 and 50 shareholders
                  </p>
                </div>
                
                {/* Share Capital */}
                <div className="space-y-2">
                  <Label htmlFor="share-capital">
                    Proposed Share Capital (AED)
                    {shareCapital > 150000 && (
                      <span className="text-red-500 ml-2 text-sm">Bank letter required</span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="share-capital"
                      type="number"
                      min="1000"
                      max="10000000"
                      step="1000"
                      value={shareCapital}
                      onChange={(e) => setShareCapital(parseInt(e.target.value) || 0)}
                      className={shareCapital > 150000 ? 'border-yellow-500' : ''}
                    />
                    <div className="absolute right-3 top-3">
                      <Calculator className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Capital Requirements Alert */}
                  {partnerVisaCount > 0 && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Partner Visa Requirement:</strong> Your {partnerVisaCount} partner 
                        visa{partnerVisaCount > 1 ? 's require' : ' requires'} minimum 
                        AED {requiredCapitalForPartnerVisa.toLocaleString()} share capital
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {shareCapital > 150000 && (
                    <div className="mt-2 space-y-2">
                      <Label htmlFor="bank-letter">
                        Bank Letter (Required for capital above AED 150,000)
                      </Label>
                      <Input
                        id="bank-letter"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setBankLetterFile(e.target.files?.[0] || null)}
                      />
                      {bankLetterFile && (
                        <p className="text-sm text-green-600">
                          ✓ {bankLetterFile.name} selected
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Share Value */}
                <div className="space-y-2">
                  <Label htmlFor="share-value">Value per Share (AED)</Label>
                  <Input
                    id="share-value"
                    type="number"
                    min="10"
                    max="10000"
                    step="10"
                    value={shareValue}
                    onChange={(e) => setShareValue(parseInt(e.target.value) || 10)}
                  />
                  <p className="text-sm text-gray-500">
                    Minimum AED 10 per share
                  </p>
                </div>
                
                {/* Total Shares (Calculated) */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Number of Shares:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalShares.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {shareCapital.toLocaleString()} AED ÷ {shareValue} AED per share
                  </p>
                </div>
                
                {/* Voting Rights */}
                <div className="space-y-3">
                  <Label>Voting Rights Structure</Label>
                  <RadioGroup
                    value={votingProportional ? 'proportional' : 'custom'}
                    onValueChange={(value) => setVotingProportional(value === 'proportional')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="proportional" id="proportional" />
                      <Label htmlFor="proportional" className="font-normal cursor-pointer">
                        Proportional to shareholding (standard)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="font-normal cursor-pointer">
                        Custom voting arrangement (requires shareholders agreement)
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {!votingProportional && (
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label htmlFor="voting-notes">
                          Describe the voting arrangement
                        </Label>
                        <textarea
                          id="voting-notes"
                          className="w-full px-3 py-2 border rounded-md"
                          rows={3}
                          value={votingNotes}
                          onChange={(e) => setVotingNotes(e.target.value)}
                          placeholder="Explain how voting rights differ from shareholding percentages..."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="shareholders-agreement">
                          Shareholders Agreement (Required)
                        </Label>
                        <Input
                          id="shareholders-agreement"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setShareholdersAgreementFile(e.target.files?.[0] || null)}
                        />
                        {shareholdersAgreementFile && (
                          <p className="text-sm text-green-600">
                            ✓ {shareholdersAgreementFile.name} selected
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Info Box */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important Notes:</strong>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                      <li>Standard share capital is AED 150,000 or less</li>
                      <li>Higher capital requires proof of funds (bank letter)</li>
                      <li>Partner visas require AED 48,000 capital per partner</li>
                      <li>Share distribution will be specified in the next step</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
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
    </div>
  )
}

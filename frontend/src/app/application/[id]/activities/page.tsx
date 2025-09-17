'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PricingBanner } from '@/components/application/PricingBanner'
import { Search, ArrowLeft, ArrowRight, Info, Star, Check, X } from 'lucide-react'
import debounce from 'lodash.debounce'

interface BusinessActivity {
  id: string
  activity_code: string
  activity_name: string
  activity_description: string
  activity_type: string
  regulation_type: string
  approving_entity_1?: string
  approving_entity_2?: string
  notes?: string
  is_free?: boolean
}

interface SelectedActivity {
  activity_id: string
  activity_name: string
  is_main: boolean
  is_free: boolean
}

export default function BusinessActivitiesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { applicationData, updateApplication, updateProgress } = useApplication()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<BusinessActivity[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>(
    applicationData.business_activities || []
  )
  const [mainActivityId, setMainActivityId] = useState(applicationData.main_activity_id || '')
  const [requestCustom, setRequestCustom] = useState(applicationData.request_custom_activity || false)
  const [customDescription, setCustomDescription] = useState(applicationData.custom_activity_description || '')
  const [countriesOfOperation, setCountriesOfOperation] = useState<string[]>(
    applicationData.countries_of_operation || ['UAE']
  )
  const [operateAsFranchise, setOperateAsFranchise] = useState(applicationData.operate_as_franchise || false)
  const [franchiseDetails, setFranchiseDetails] = useState(applicationData.franchise_details || '')
  const [acceptRules, setAcceptRules] = useState(applicationData.accept_activity_rules || false)
  const [errors, setErrors] = useState<string[]>([])
  
  // Debounced search function
  const searchActivities = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([])
        return
      }
      
      setSearching(true)
      try {
        const response = await fetch(`http://localhost:3001/api/v1/business_activities/search?q=${encodeURIComponent(query)}&freezone=IFZA`)
        const data = await response.json()
        
        if (data.success) {
          // Mark first 3 as free if not already selected
          const results = data.data.map((activity: BusinessActivity, index: number) => ({
            ...activity,
            is_free: selectedActivities.length + index < 3
          }))
          setSearchResults(results)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearching(false)
      }
    }, 300),
    [selectedActivities.length]
  )
  
  useEffect(() => {
    searchActivities(searchTerm)
  }, [searchTerm, searchActivities])
  
  useEffect(() => {
    updateProgress(2, 'activities')
  }, [])
  
  const handleAddActivity = (activity: BusinessActivity) => {
    if (selectedActivities.length >= 10) {
      setErrors(['Maximum 10 activities allowed'])
      return
    }
    
    // Check if already selected
    if (selectedActivities.find(a => a.activity_id === activity.id)) {
      setErrors(['This activity is already selected'])
      return
    }
    
    const newActivity: SelectedActivity = {
      activity_id: activity.id,
      activity_name: activity.activity_name,
      is_main: selectedActivities.length === 0, // First one is main by default
      is_free: selectedActivities.length < 3 // First 3 are free
    }
    
    const updated = [...selectedActivities, newActivity]
    setSelectedActivities(updated)
    
    // Set as main if it's the first one
    if (updated.length === 1) {
      setMainActivityId(activity.id)
    }
    
    // Clear search
    setSearchTerm('')
    setSearchResults([])
    setErrors([])
  }
  
  const handleRemoveActivity = (activityId: string) => {
    const updated = selectedActivities.filter(a => a.activity_id !== activityId)
    setSelectedActivities(updated)
    
    // If removed was main, set first as main
    if (mainActivityId === activityId && updated.length > 0) {
      setMainActivityId(updated[0].activity_id)
      updated[0].is_main = true
    }
  }
  
  const handleSetMain = (activityId: string) => {
    setMainActivityId(activityId)
    setSelectedActivities(prev => 
      prev.map(a => ({
        ...a,
        is_main: a.activity_id === activityId
      }))
    )
  }
  
  const validateAndContinue = async () => {
    const validationErrors = []
    
    if (selectedActivities.length === 0) {
      validationErrors.push('Please select at least one business activity')
    }
    
    if (!mainActivityId && selectedActivities.length > 0) {
      validationErrors.push('Please select a main activity')
    }
    
    if (requestCustom && !customDescription) {
      validationErrors.push('Please describe your custom activity')
    }
    
    if (operateAsFranchise && !franchiseDetails) {
      validationErrors.push('Please provide franchise details')
    }
    
    if (!acceptRules) {
      validationErrors.push('Please accept the activity rules and regulations')
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    // Save data
    await updateApplication({
      business_activities: selectedActivities,
      main_activity_id: mainActivityId,
      request_custom_activity: requestCustom,
      custom_activity_description: customDescription,
      countries_of_operation: countriesOfOperation,
      operate_as_franchise: operateAsFranchise,
      franchise_details: franchiseDetails,
      accept_activity_rules: acceptRules
    }, 'activities')
    
    router.push(`/application/${params.id}/names`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/license`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Activities</CardTitle>
                <CardDescription>
                  Select your business activities. The first 3 activities are free, additional activities incur fees.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search Activities</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, description, or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {searchResults.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddActivity(activity)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{activity.activity_name}</div>
                              <div className="text-sm text-gray-500">{activity.activity_description}</div>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {activity.activity_type}
                                </Badge>
                                {activity.regulation_type === 'Regulated' && (
                                  <Badge variant="destructive" className="text-xs">
                                    Regulated
                                  </Badge>
                                )}
                                {selectedActivities.length < 3 && (
                                  <Badge variant="default" className="text-xs bg-green-500">
                                    Free
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searching && (
                    <div className="text-center py-4 text-gray-500">
                      Searching activities...
                    </div>
                  )}
                </div>
                
                {/* Activity Counter & Pricing Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-blue-900">Business Activities Summary</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('/business-activities', '_blank')}
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      Research Activities
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Included Activities:</span>
                      <span className="ml-2 font-semibold text-green-600">{Math.min(selectedActivities.length, 3)}/3 Free</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Additional Activities:</span>
                      <span className="ml-2 font-semibold text-orange-600">
                        {Math.max(0, selectedActivities.length - 3)} × AED 1,000
                      </span>
                    </div>
                  </div>
                  {selectedActivities.length > 3 && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <span className="text-sm text-gray-600">Additional Cost: </span>
                      <span className="font-bold text-orange-600">
                        AED {((selectedActivities.length - 3) * 1000).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Business Activity Slots */}
                <div className="space-y-2">
                  <Label>Business Activities (Maximum 10)</Label>
                  <div className="space-y-3">
                    {/* Render 3 skeleton slots */}
                    {[0, 1, 2].map((slotIndex) => {
                      const activity = selectedActivities[slotIndex];
                      return (
                        <div
                          key={`slot-${slotIndex}`}
                          className={`border-2 rounded-lg p-4 ${
                            activity 
                              ? activity.is_main 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-green-500 bg-green-50'
                              : 'border-dashed border-gray-300 bg-gray-50'
                          }`}
                        >
                          {activity ? (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{activity.activity_name}</span>
                                  {activity.is_main && (
                                    <Badge className="bg-blue-500">Main Activity</Badge>
                                  )}
                                  <Badge variant="default" className="bg-green-500">Free</Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!activity.is_main && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetMain(activity.activity_id)}
                                  >
                                    Set as Main
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveActivity(activity.activity_id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="text-gray-500 mb-2">
                                {slotIndex === 0 ? 'Main Business Activity' : `Business Activity ${slotIndex + 1}`}
                              </div>
                              <div className="text-sm text-green-600 font-medium">Free Slot</div>
                              <div className="text-xs text-gray-400 mt-1">
                                Search and select an activity above
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Additional paid activities */}
                    {selectedActivities.slice(3).map((activity, index) => (
                      <div
                        key={activity.activity_id}
                        className="border-2 border-orange-500 bg-orange-50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{activity.activity_name}</span>
                              <Badge variant="destructive" className="bg-orange-500">
                                AED 1,000
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!activity.is_main && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetMain(activity.activity_id)}
                              >
                                Set as Main
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveActivity(activity.activity_id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedActivities.length < 3 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Tip:</strong> The first 3 activities are free. We recommend selecting at least 3 activities to maximize your license value.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {/* Custom Activity Request */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="custom"
                      checked={requestCustom}
                      onCheckedChange={(checked) => setRequestCustom(checked as boolean)}
                    />
                    <Label htmlFor="custom">Request a custom activity not listed above</Label>
                  </div>
                  
                  {requestCustom && (
                    <Textarea
                      placeholder="Describe your custom business activity..."
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  )}
                </div>
                
                {/* Countries of Operation */}
                <div className="space-y-2">
                  <Label>Countries of Operation</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uae"
                      checked={countriesOfOperation.includes('UAE')}
                      disabled
                    />
                    <Label htmlFor="uae">United Arab Emirates (Required)</Label>
                  </div>
                </div>
                
                {/* Franchise */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="franchise"
                      checked={operateAsFranchise}
                      onCheckedChange={(checked) => setOperateAsFranchise(checked as boolean)}
                    />
                    <Label htmlFor="franchise">Will you operate as a franchise?</Label>
                  </div>
                  
                  {operateAsFranchise && (
                    <Textarea
                      placeholder="Provide franchise details..."
                      value={franchiseDetails}
                      onChange={(e) => setFranchiseDetails(e.target.value)}
                      className="mt-2"
                      rows={2}
                    />
                  )}
                </div>
                
                {/* Accept Rules */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accept"
                    checked={acceptRules}
                    onCheckedChange={(checked) => setAcceptRules(checked as boolean)}
                  />
                  <Label htmlFor="accept" className="text-sm">
                    I understand and accept the rules and regulations for the selected business activities
                  </Label>
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
    </div>
  )
}

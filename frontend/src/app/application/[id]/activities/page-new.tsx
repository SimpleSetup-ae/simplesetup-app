'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApplication } from '@/contexts/ApplicationContext'
import { StandardFormLayout } from '@/components/application/StandardFormLayout'
import { FormSection } from '@/components/application/FormSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Search, Info, Star, Check, X } from 'lucide-react'
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
          setSearchResults(data.data || [])
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
    
    const newActivity: SelectedActivity = {
      activity_id: activity.id,
      activity_name: activity.activity_name,
      is_main: selectedActivities.length === 0, // First activity becomes main
      is_free: selectedActivities.length < 3
    }
    
    setSelectedActivities([...selectedActivities, newActivity])
    
    if (selectedActivities.length === 0) {
      setMainActivityId(activity.id)
    }
    
    setErrors([])
  }
  
  const handleRemoveActivity = (activityId: string) => {
    const updatedActivities = selectedActivities.filter(a => a.activity_id !== activityId)
    setSelectedActivities(updatedActivities)
    
    // If we removed the main activity, make the first remaining one main
    if (activityId === mainActivityId && updatedActivities.length > 0) {
      const newMain = updatedActivities[0]
      newMain.is_main = true
      setMainActivityId(newMain.activity_id)
      setSelectedActivities([...updatedActivities])
    }
  }
  
  const handleSetMain = (activityId: string) => {
    const updatedActivities = selectedActivities.map(activity => ({
      ...activity,
      is_main: activity.activity_id === activityId
    }))
    setSelectedActivities(updatedActivities)
    setMainActivityId(activityId)
  }
  
  const validateAndContinue = async () => {
    const validationErrors = []
    
    if (selectedActivities.length === 0) {
      validationErrors.push('Please select at least one business activity')
    }
    
    if (!mainActivityId) {
      validationErrors.push('Please select a main business activity')
    }
    
    if (!acceptRules) {
      validationErrors.push('Please accept the business activity rules and regulations')
    }
    
    if (requestCustom && !customDescription.trim()) {
      validationErrors.push('Please describe your custom activity request')
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
      accept_activity_rules: acceptRules
    }, 'activities')
    
    router.push(`/application/${params.id}/names`)
  }
  
  const handleBack = () => {
    router.push(`/application/${params.id}/license`)
  }
  
  return (
    <StandardFormLayout
      title="Business Activities"
      subtitle="Select your business activities. The first 3 activities are free, additional activities incur fees."
      onBack={handleBack}
      onContinue={validateAndContinue}
      errors={errors}
    >
      {/* Search Section */}
      <FormSection
        title="Search Business Activities"
        description="Find and add your business activities. First 3 are free!"
      >
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Type to search activities (e.g., 'software development', 'consultancy')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg border-2 focus:border-brand-500"
            />
          </div>
          
          {/* Quick Suggestions */}
          {searchTerm.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Popular activities:</p>
              <div className="flex flex-wrap gap-2">
                {['Software Development', 'Business Consultancy', 'Trading', 'Marketing Services', 'Real Estate'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-600 font-medium">Found {searchResults.length} activities:</p>
              {searchResults.map((activity) => {
                const isSelected = selectedActivities.some(a => a.activity_id === activity.id)
                const willBeFree = selectedActivities.length < 3 && !isSelected
                
                return (
                  <div
                    key={activity.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-brand-300'
                    }`}
                    onClick={() => isSelected ? handleRemoveActivity(activity.id) : handleAddActivity(activity)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-lora text-lg font-medium text-gray-900">
                            {activity.activity_name}
                          </h4>
                          {willBeFree && (
                            <Badge className="bg-green-500 text-white">FREE</Badge>
                          )}
                          {!willBeFree && !isSelected && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              AED 1,000
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                          {activity.activity_description}
                        </p>
                      </div>
                      <div className="ml-4">
                        {isSelected ? (
                          <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                            <Check className="h-4 w-4 mr-1" />
                            Added
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-brand hover:bg-brand-600">
                            Add Activity
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {searching && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Searching activities...</p>
            </div>
          )}
          
          {searchTerm.length >= 2 && searchResults.length === 0 && !searching && (
            <div className="text-center py-8 text-gray-500">
              <p>No activities found for "{searchTerm}"</p>
              <p className="text-sm mt-1">Try different keywords or browse popular activities above</p>
            </div>
          )}
        </div>
      </FormSection>
      
      {/* Selected Activities */}
      {selectedActivities.length > 0 && (
        <FormSection
          title="Your Selected Activities"
          description={`${selectedActivities.length} ${selectedActivities.length === 1 ? 'activity' : 'activities'} selected • ${Math.min(selectedActivities.length, 3)} free, ${Math.max(0, selectedActivities.length - 3)} paid`}
        >
          <div className="space-y-3">
            {selectedActivities.map((activity, index) => {
              const isFree = index < 3
              const isMain = activity.is_main
              
              return (
                <div
                  key={activity.activity_id}
                  className={`p-4 rounded-lg border-2 ${
                    isMain 
                      ? 'border-blue-500 bg-blue-50' 
                      : isFree 
                        ? 'border-green-500 bg-green-50'
                        : 'border-orange-500 bg-orange-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-lora text-lg font-medium text-gray-900">
                          {activity.activity_name}
                        </h4>
                        {isMain && (
                          <Badge className="bg-blue-500 text-white">MAIN ACTIVITY</Badge>
                        )}
                        {isFree && !isMain && (
                          <Badge className="bg-green-500 text-white">FREE</Badge>
                        )}
                        {!isFree && (
                          <Badge className="bg-orange-500 text-white">AED 1,000</Badge>
                        )}
                      </div>
                      {!isMain && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetMain(activity.activity_id)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set as Main Activity
                        </Button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveActivity(activity.activity_id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {/* Pricing Summary */}
            {selectedActivities.length > 3 && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-orange-900">Additional Activities Cost:</span>
                  <span className="font-bold text-orange-900 text-lg">
                    AED {((selectedActivities.length - 3) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </FormSection>
      )}
      
      {/* Getting Started Hint */}
      {selectedActivities.length === 0 && searchTerm.length === 0 && (
        <FormSection
          title="Getting Started"
          description="Need help choosing activities? Here are some tips:"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-lora text-lg font-medium text-blue-900 mb-2">💡 Tips for Choosing Activities</h4>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• <strong>Start with your main business:</strong> What's your primary source of income?</li>
                <li>• <strong>Think broadly:</strong> Include related services you might offer</li>
                <li>• <strong>Consider the future:</strong> Activities you might expand into</li>
                <li>• <strong>First 3 are free:</strong> Take advantage of the included activities</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => window.open('/business-activities', '_blank')}
                className="text-brand-600 border-brand-300 hover:bg-brand-50"
              >
                <Info className="h-4 w-4 mr-2" />
                Browse All Activities
              </Button>
            </div>
          </div>
        </FormSection>
      )}

      {/* Additional Options */}
      {selectedActivities.length > 0 && (
        <FormSection
          title="Additional Options"
          description="Optional settings for your business activities"
        >
          <div className="space-y-6">
            {/* Custom Activity Request */}
            <div className="space-y-3">
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
                  placeholder="Describe the custom activity you need..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="mt-2"
                  rows={3}
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
          </div>
        </FormSection>
      )}
    </StandardFormLayout>
  )
}


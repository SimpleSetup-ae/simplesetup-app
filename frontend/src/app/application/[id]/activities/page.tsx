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
import { Search, Info, Star, Check, X, ChevronRight } from 'lucide-react'
import { apiGet } from '@/lib/api'
import { BUSINESS_ACTIVITIES_FREE_COUNT, BUSINESS_ACTIVITIES_MAX_COUNT } from '@/lib/constants'
import { Badge as UiBadge } from '@/components/ui/badge'
import { Input as UiInput } from '@/components/ui/input'

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
  activity_code?: string
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
  const [requestCustom, setRequestCustom] = useState(applicationData.request_custom_activity ?? false)
  const [customDescription, setCustomDescription] = useState(applicationData.custom_activity_description || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [acceptRules, setAcceptRules] = useState(applicationData.accept_activity_rules || false)
  const [errors, setErrors] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>(applicationData.countries_of_operation || ['United Arab Emirates'])
  const [countryQuery, setCountryQuery] = useState('')
  const [countrySuggestions, setCountrySuggestions] = useState<Array<{ code: string | null; name: string; continent?: string }>>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
 
  // Auto-save whenever selection or related fields change
  useEffect(() => {
    if (!applicationData?.id) return
    updateApplication({
      business_activities: selectedActivities,
      main_activity_id: mainActivityId,
      request_custom_activity: requestCustom,
      custom_activity_description: customDescription,
      accept_activity_rules: acceptRules,
      countries_of_operation: countries
    }, 'activities')
  }, [selectedActivities, mainActivityId, requestCustom, customDescription, acceptRules, countries])
  
  // Load country suggestions with debounce
  useEffect(() => {
    const q = countryQuery.trim()
    if (q.length === 0) {
      setCountrySuggestions([])
      return
    }
    const t = setTimeout(async () => {
      try {
        setLoadingCountries(true)
        const res = await apiGet(`/countries?q=${encodeURIComponent(q)}&include_continents=true&limit=8`)
        const data = await res.json()
        if (data && Array.isArray(data.data)) {
          setCountrySuggestions(data.data)
        } else {
          setCountrySuggestions([])
        }
      } catch (e) {
        setCountrySuggestions([])
      } finally {
        setLoadingCountries(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [countryQuery])

  const addCountry = (name: string) => {
    if (!name) return
    if (countries.includes(name)) return
    setCountries(prev => [...prev, name])
    setCountryQuery('')
    setCountrySuggestions([])
  }

  // Debounced search function
  const searchActivities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const response = await apiGet(`/business_activities/search?q=${encodeURIComponent(query)}&freezone=IFZA`)
      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        const normalized: BusinessActivity[] = data.data.map((activity: any) => ({
          ...activity,
          id: String(activity.id)
        }))
        const filteredResults = normalized.filter((activity: BusinessActivity) => 
          !selectedActivities.some(selected => selected.activity_id === activity.id)
        )
        setSearchResults(filteredResults)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [selectedActivities])
  
  useEffect(() => {
    const t = setTimeout(() => searchActivities(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm, searchActivities])
  
  useEffect(() => {
    updateProgress(2, 'activities')
  }, [])
  
  const handleAddActivity = (activity: BusinessActivity) => {
    if (selectedActivities.length >= BUSINESS_ACTIVITIES_MAX_COUNT) {
      setErrors([`Maximum ${BUSINESS_ACTIVITIES_MAX_COUNT} activities allowed`])
      return
    }
    
    const newActivity: SelectedActivity = {
      activity_id: String(activity.id),
      activity_name: activity.activity_name,
      activity_code: activity.activity_code,
      is_main: selectedActivities.length === 0,
      is_free: selectedActivities.length < BUSINESS_ACTIVITIES_FREE_COUNT
    }
    
    setSelectedActivities([...selectedActivities, newActivity])
    
    if (selectedActivities.length === 0) {
      setMainActivityId(String(activity.id))
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

  const handleExportCSV = async () => {
    try {
      // Fetch all activities from the API
      const response = await apiGet('/business_activities?freezone=IFZA')
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        // Convert to CSV format
        const csvHeaders = ['Activity Code', 'Activity Name', 'Activity Description', 'Type', 'Regulation Type']
        const csvRows = data.data.map((activity: BusinessActivity) => [
          activity.activity_code || '',
          activity.activity_name || '',
          activity.activity_description || '',
          activity.activity_type || '',
          activity.regulation_type || ''
        ])
        
        // Create CSV content
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
        ].join('\n')
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `IFZA_Business_Activities_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Export error:', err)
      setErrors(['Failed to export activities. Please try again.'])
    }
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
        headerActions={
          <div className="flex gap-2">
            <Button 
              asChild
              variant="outline" 
              size="sm"
              className="text-brand-600 border-brand-300 hover:bg-brand-50"
            >
              <a href="/business-activities" target="_blank" rel="noopener noreferrer">View All Activities</a>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportCSV}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Export to CSV
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, description, or activity code (e.g., 'software', 'trading', '4741004')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg border-2 focus:border-brand-500"
            />
          </div>
          
          {/* Popular Searches */}
          {searchTerm.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Software', 'Trading', 'Consultancy', 'Marketing', 
                  'Real Estate', 'IT Services', 'E-commerce', 'Import Export'
                ].map((suggestion) => (
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
                const willBeFree = selectedActivities.length < BUSINESS_ACTIVITIES_FREE_COUNT && !isSelected
                
                return (
                  <div
                    key={activity.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-brand-300'
                    }`}
                    onClick={() => isSelected ? handleRemoveActivity(String(activity.id)) : handleAddActivity(activity)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-lora text-lg font-medium text-gray-900">
                            {activity.activity_name}
                          </h4>
                          {!willBeFree && !isSelected && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              AED 1,000
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            Code: {activity.activity_code}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {activity.activity_type}
                          </Badge>
                          {activity.regulation_type === 'Regulated' && (
                            <Badge variant="destructive" className="text-xs">
                              Regulated
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
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
          
          {/* Advanced Options */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newAdvancedState = !showAdvanced
                setShowAdvanced(newAdvancedState)
                // Reset custom activity request when closing advanced options
                if (!newAdvancedState) {
                  setRequestCustom(false)
                  setCustomDescription('')
                }
              }}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ChevronRight 
                className={`h-4 w-4 mr-1 transition-transform ${
                  showAdvanced ? 'rotate-90' : ''
                }`} 
              />
              {showAdvanced ? 'Hide Advanced' : 'Advanced Options'}
            </Button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom"
                    checked={requestCustom}
                    onCheckedChange={(checked) => setRequestCustom(checked as boolean)}
                  />
                  <Label htmlFor="custom" className="text-sm">
                    Request a custom activity not listed above
                  </Label>
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
            )}
          </div>
        </div>
      </FormSection>
      
      {/* Selected Activities */}
      {selectedActivities.length > 0 && (
        <FormSection
          title="Your Selected Activities"
          description={`${selectedActivities.length} ${selectedActivities.length === 1 ? 'activity' : 'activities'} selected • ${Math.min(selectedActivities.length, BUSINESS_ACTIVITIES_FREE_COUNT)} free, ${Math.max(0, selectedActivities.length - BUSINESS_ACTIVITIES_FREE_COUNT)} paid`}
        >
          <div className="space-y-3">
            {selectedActivities.map((activity, index) => {
              const isFree = index < BUSINESS_ACTIVITIES_FREE_COUNT
              const isMain = activity.is_main
              
              return (
                <div
                  key={activity.activity_id}
                  className={`p-4 rounded-lg border-2 ${
                    isMain 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
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
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">FREE</Badge>
                        )}
                        {!isFree && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">AED 1,000</Badge>
                        )}
                      </div>
                      <div className="mb-2">
                        {activity.activity_code && (
                          <Badge variant="secondary" className="text-xs">
                            Code: {activity.activity_code}
                          </Badge>
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
            {selectedActivities.length > BUSINESS_ACTIVITIES_FREE_COUNT && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-orange-900">Additional Activities Cost:</span>
                  <span className="font-bold text-orange-900 text-lg">
                    AED {((selectedActivities.length - BUSINESS_ACTIVITIES_FREE_COUNT) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </FormSection>
      )}
      
      {/* Countries of Operating Business */}
      <FormSection
        title="Countries of Operating Business"
        description="Select the countries where your company will operate. UAE is preselected."
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => (
              <UiBadge key={c} variant="secondary" className="flex items-center gap-1">
                {c}
                <button
                  type="button"
                  onClick={() => setCountries(prev => prev.filter(x => x !== c))}
                  className="ml-1 text-gray-600 hover:text-gray-900"
                  aria-label={`Remove ${c}`}
                >
                  ×
                </button>
              </UiBadge>
            ))}
          </div>
          <div className="flex flex-col gap-2 items-start max-w-md">
            <UiInput
              placeholder="Type to search countries or continents"
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (countrySuggestions.length > 0) {
                    addCountry(countrySuggestions[0].name)
                  }
                }
              }}
            />
            {countryQuery && (
              <div className="w-full border rounded-md bg-white shadow-sm max-h-64 overflow-y-auto">
                {loadingCountries && (
                  <div className="p-2 text-sm text-gray-500">Loading...</div>
                )}
                {!loadingCountries && countrySuggestions.length === 0 && (
                  <div className="p-2 text-sm text-gray-500">No matches</div>
                )}
                {countrySuggestions.map((opt) => (
                  <button
                    key={`${opt.code || 'continent'}-${opt.name}`}
                    type="button"
                    onClick={() => addCountry(opt.name)}
                    className="w-full text-left p-2 hover:bg-gray-50 text-sm"
                  >
                    {opt.name}
                    {opt.continent && opt.code && (
                      <span className="ml-2 text-gray-500">({opt.code})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormSection>
      
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
            
          </div>
        </FormSection>
      )}

      {/* Final Confirmation */}
      {selectedActivities.length > 0 && (
        <FormSection
          title="Final Confirmation"
          description="Please confirm you understand the business activity requirements"
        >
          <div className="space-y-6">
            
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

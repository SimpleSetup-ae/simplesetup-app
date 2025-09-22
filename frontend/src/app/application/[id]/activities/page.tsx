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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, ArrowLeft, ArrowRight, Info, Star, Check, X, Plus, Lightbulb, DollarSign, Filter, HelpCircle, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={handleBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Activities</h1>
              <p className="text-gray-600 mt-1">Choose activities that best describe your business</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                ✓
              </div>
              <span>License</span>
            </div>
            <div className="w-8 h-0.5 bg-green-500"></div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
              <span className="font-medium text-blue-600">Activities</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-xs">
                3
              </div>
              <span>Company Names</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">{selectedActivities.length}/10</div>
                    <div className="text-xs sm:text-sm opacity-90">Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-300">
                      {Math.min(selectedActivities.length, 3)}/3
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Free</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-orange-300">
                      {Math.max(0, selectedActivities.length - 3)} × 1k
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Extra Cost</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="search" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Activities
                </TabsTrigger>
                <TabsTrigger value="selected" className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Selected Activities ({selectedActivities.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-6">
                {/* Smart Search */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      Find Your Business Activities
                    </CardTitle>
                    <CardDescription>
                      Search by name, description, or code. The first 3 activities are free!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search activities... (e.g., 'consulting', 'ecommerce', 'trading')"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-lg py-3"
                      />
                    </div>

                    {/* Filter Options */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select onValueChange={setSearchTerm}>
                        <SelectTrigger className="w-full sm:w-auto">
                          <SelectValue placeholder="💡 Popular Searches" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consulting">Management Consulting</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="trading">General Trading</SelectItem>
                          <SelectItem value="technology">IT Services</SelectItem>
                          <SelectItem value="advertising">Advertising</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select defaultValue="all">
                        <SelectTrigger className="w-full sm:w-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="border rounded-lg max-h-80 overflow-y-auto">
                        {searchResults.map((activity) => (
                          <div
                            key={activity.id}
                            className="p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors"
                            onClick={() => handleAddActivity(activity)}
                          >
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{activity.activity_name}</h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {activity.activity_code}
                                  </Badge>
                                  <Badge variant={activity.activity_type === 'Professional' ? 'default' : 'outline'}>
                                    {activity.activity_type}
                                  </Badge>
                                  {activity.regulation_type === 'Regulated' && (
                                    <Badge variant="destructive">Regulated</Badge>
                                  )}
                                  {selectedActivities.length < 3 && (
                                    <Badge variant="default" className="bg-green-500 text-white">
                                      <Star className="h-3 w-3 mr-1" />
                                      Free
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{activity.activity_description}</p>
                                {activity.notes && (
                                  <p className="text-xs text-gray-500">{activity.notes}</p>
                                )}
                              </div>
                              <Button size="sm" className="shrink-0 self-start sm:self-center w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Activity
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searching && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Searching activities...</p>
                      </div>
                    )}

                    {!searching && searchTerm && searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No activities found for "{searchTerm}"</p>
                        <p className="text-sm text-gray-400 mt-1">Try a different search term or browse popular activities</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tips</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• The first 3 activities are completely free</li>
                          <li>• Choose your main activity first - it's most important for your license</li>
                          <li>• Professional activities often have fewer restrictions</li>
                          <li>• Consider activities that complement each other</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="selected" className="space-y-6">
                {/* Selected Activities Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      Your Selected Activities
                    </CardTitle>
                    <CardDescription>
                      Manage your activities. Drag to reorder or click to modify.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedActivities.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No activities selected yet</h3>
                        <p className="text-gray-500 mb-4">Start by searching for activities that match your business</p>
                        <Button onClick={() => {}} variant="outline">
                          Start Searching
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedActivities.map((activity, index) => (
                          <div
                            key={activity.activity_id}
                            className={`border-2 rounded-lg p-4 transition-all ${
                              activity.is_main
                                ? 'border-blue-500 bg-blue-50'
                                : index < 3
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-orange-500 bg-orange-50'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-lg text-gray-900">
                                    {index + 1}.
                                  </span>
                                  <span className="font-medium">{activity.activity_name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {activity.activity_id}
                                  </Badge>
                                  {activity.is_main && (
                                    <Badge className="bg-blue-500 text-white">
                                      Main Activity
                                    </Badge>
                                  )}
                                  {index < 3 ? (
                                    <Badge className="bg-green-500 text-white">Free</Badge>
                                  ) : (
                                    <Badge variant="destructive" className="bg-orange-500">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      1,000 AED
                                    </Badge>
                                  )}
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Additional Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Custom Activity Request */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="custom"
                      checked={requestCustom}
                      onCheckedChange={(checked) => setRequestCustom(checked as boolean)}
                    />
                    <Label htmlFor="custom" className="font-medium">
                      Request a custom activity not listed above
                    </Label>
                  </div>

                  {requestCustom && (
                    <div className="pl-6">
                      <Textarea
                        placeholder="Describe your custom business activity in detail..."
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        We'll review your request and get back to you within 24 hours
                      </p>
                    </div>
                  )}
                </div>

                {/* Countries of Operation */}
                <div className="space-y-3">
                  <Label className="font-medium">Countries of Operation</Label>
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
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="franchise"
                      checked={operateAsFranchise}
                      onCheckedChange={(checked) => setOperateAsFranchise(checked as boolean)}
                    />
                    <Label htmlFor="franchise" className="font-medium">
                      Will you operate as a franchise?
                    </Label>
                  </div>

                  {operateAsFranchise && (
                    <div className="pl-6">
                      <Textarea
                        placeholder="Provide franchise details including franchisor name, agreement terms, etc..."
                        value={franchiseDetails}
                        onChange={(e) => setFranchiseDetails(e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                {/* Accept Rules */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="accept"
                    checked={acceptRules}
                    onCheckedChange={(checked) => setAcceptRules(checked as boolean)}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor="accept" className="text-sm font-medium cursor-pointer">
                      I understand and accept the rules and regulations for the selected business activities
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      By checking this, you confirm you understand the regulatory requirements for your chosen activities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button variant="outline" onClick={handleBack} size="lg" className="order-2 sm:order-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to License
              </Button>
              <Button onClick={validateAndContinue} size="lg" className="px-8 order-1 sm:order-2 w-full sm:w-auto">
                Continue to Names
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <PricingBanner />

            {/* Help Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Need Help?</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Not sure which activities to choose? Our experts can help you select the right ones for your business.
                    </p>
                    <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100">
                      Get Expert Help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="fixed bottom-4 right-4 max-w-md">
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Check, Star, DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { BusinessActivity, SelectedActivity, ValidationResult } from '../types/FormConfig'

interface BusinessActivitiesSelectorProps {
  freezone: string;
  selectedActivities: SelectedActivity[];
  mainActivityId: number | null;
  maxFreeActivities: number;
  onActivitiesChange: (activities: SelectedActivity[], mainActivityId: number | null) => void;
  onValidationChange: (result: ValidationResult) => void;
  className?: string;
}

export function BusinessActivitiesSelector({
  freezone,
  selectedActivities = [],
  mainActivityId,
  maxFreeActivities = 3,
  onActivitiesChange,
  onValidationChange,
  className = ''
}: BusinessActivitiesSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableActivities, setAvailableActivities] = useState<BusinessActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<BusinessActivity[]>([]);

  // Load available business activities
  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/business_activities?freezone=${freezone}`);
      const result = await response.json();
      
      if (result.data) {
        setAvailableActivities(result.data);
        setSearchResults(result.data.slice(0, 20)); // Show first 20 initially
      }
    } catch (error) {
      console.error('Failed to load business activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [freezone]);

  // Search activities
  const searchActivities = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(availableActivities.slice(0, 20));
      return;
    }

    try {
      const response = await fetch(`/api/v1/business_activities/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to local search
      const filtered = availableActivities.filter(activity =>
        activity.activity_name.toLowerCase().includes(query.toLowerCase()) ||
        activity.activity_description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20);
      setSearchResults(filtered);
    }
  }, [availableActivities]);

  // Handle search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchActivities(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchActivities]);

  // Toggle activity selection
  const toggleActivity = useCallback((activity: BusinessActivity) => {
    const isCurrentlySelected = selectedActivities.some(a => a.id === activity.id);
    
    if (isCurrentlySelected) {
      // Remove activity
      const newActivities = selectedActivities.filter(a => a.id !== activity.id);
      const newMainId = mainActivityId === activity.id ? (newActivities[0]?.id || null) : mainActivityId;
      onActivitiesChange(newActivities, newMainId);
    } else {
      // Add activity
      const newActivity: SelectedActivity = {
        id: activity.id,
        activity_code: activity.activity_code,
        activity_name: activity.activity_name,
        is_main: selectedActivities.length === 0, // First activity is main by default
        is_free: selectedActivities.length < maxFreeActivities
      };
      
      const newActivities = [...selectedActivities, newActivity];
      const newMainId = newActivity.is_main ? newActivity.id : mainActivityId;
      onActivitiesChange(newActivities, newMainId);
    }
  }, [selectedActivities, mainActivityId, maxFreeActivities, onActivitiesChange]);

  // Set main activity
  const setMainActivity = useCallback((activityId: number) => {
    const updatedActivities = selectedActivities.map(activity => ({
      ...activity,
      is_main: activity.id === activityId
    }));
    onActivitiesChange(updatedActivities, activityId);
  }, [selectedActivities, onActivitiesChange]);

  // Validate current selection
  const validateSelection = useCallback(() => {
    const errors: string[] = [];
    
    if (selectedActivities.length === 0) {
      errors.push('Please select at least one business activity');
    }
    
    if (selectedActivities.length > 0 && !mainActivityId) {
      errors.push('Please select a main business activity');
    }
    
    const mainActivity = selectedActivities.find(a => a.id === mainActivityId);
    if (mainActivityId && !mainActivity) {
      errors.push('Main activity must be one of the selected activities');
    }
    
    const result: ValidationResult = {
      valid: errors.length === 0,
      errors
    };
    
    onValidationChange(result);
    return result;
  }, [selectedActivities, mainActivityId, onValidationChange]);

  // Calculate costs
  const costInfo = useMemo(() => {
    const freeCount = Math.min(selectedActivities.length, maxFreeActivities);
    const paidCount = Math.max(0, selectedActivities.length - maxFreeActivities);
    
    return {
      freeCount,
      paidCount,
      totalSelected: selectedActivities.length,
      hasExtraFees: paidCount > 0
    };
  }, [selectedActivities.length, maxFreeActivities]);

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Validate on selection change
  useEffect(() => {
    validateSelection();
  }, [validateSelection]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading business activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">What does your company do?</h2>
        <p className="text-muted-foreground">
          Search and select your business activities. First {maxFreeActivities} are free.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Type what your business does..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-12 text-base rounded-xl"
        />
      </div>

      {/* Selected Activities Summary */}
      {selectedActivities.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Selected Activities ({selectedActivities.length})</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {costInfo.freeCount} Free
              </Badge>
              {costInfo.hasExtraFees && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {costInfo.paidCount} Paid
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {selectedActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  {activity.is_main && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  <span className="text-sm font-medium">{activity.activity_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {activity.activity_code}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {!activity.is_free && <DollarSign className="h-4 w-4 text-orange-500" />}
                  {!activity.is_main && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMainActivity(activity.id)}
                      className="text-xs"
                    >
                      Set as Main
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActivity(availableActivities.find(a => a.id === activity.id)!)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {searchResults.map((activity) => {
          const isSelected = selectedActivities.some(a => a.id === activity.id);
          const isMain = mainActivityId === activity.id;
          
          return (
            <Card 
              key={activity.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleActivity(activity)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base">{activity.activity_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_code}
                    </Badge>
                    {activity.activity_type && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.activity_type}
                      </Badge>
                    )}
                    {isMain && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.activity_description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {isSelected ? (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {searchResults.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? `No activities found for "${searchTerm}"` : 'No activities available'}
          </p>
          {searchTerm && (
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm('');
                setSearchResults(availableActivities.slice(0, 20));
              }}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Help Text */}
      {selectedActivities.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {costInfo.hasExtraFees ? (
            <p>Additional activities beyond the first {maxFreeActivities} may incur extra fees.</p>
          ) : (
            <p>All selected activities are included free with your license.</p>
          )}
        </div>
      )}
    </div>
  );
}

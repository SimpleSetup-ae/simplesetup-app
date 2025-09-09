'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormStep } from '../components/FormStep'
import { SearchableSelector } from '../components/SearchableSelector'
import { BusinessActivity, SelectedActivity, ValidationResult } from '../types/FormConfig'
import { mockBusinessActivities } from '@/lib/mockApi'

interface BusinessActivitiesStepProps {
  selectedActivities: SelectedActivity[];
  mainActivityId: number | null;
  freezone: string;
  maxFreeActivities: number;
  onDataChange: (data: { business_activities: SelectedActivity[]; main_activity_id: number | null }) => void;
  onValidationChange: (result: ValidationResult) => void;
}

export function BusinessActivitiesStep({
  selectedActivities = [],
  mainActivityId,
  freezone,
  maxFreeActivities = 3,
  onDataChange,
  onValidationChange
}: BusinessActivitiesStepProps) {
  const [availableActivities, setAvailableActivities] = useState<BusinessActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load business activities (with mock fallback for testing)
  useEffect(() => {
    const loadActivities = async () => {
      try {
        // Try real API first, fallback to mock for testing
        try {
          const response = await fetch(`/api/v1/business_activities?freezone=${freezone}`);
          const result = await response.json();
          
          if (result.data) {
            setAvailableActivities(result.data);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using mock business activities for testing');
        }
        
        // Fallback to mock data for testing
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        setAvailableActivities(mockBusinessActivities);
        
      } catch (error) {
        console.error('Failed to load business activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [freezone]);

  // Handle activity selection
  const handleSelectionChange = (activities: BusinessActivity[]) => {
    const newSelectedActivities: SelectedActivity[] = activities.map((activity, index) => ({
      id: activity.id,
      activity_code: activity.activity_code,
      activity_name: activity.activity_name,
      is_main: index === 0 && !mainActivityId, // First selected becomes main if none set
      is_free: index < maxFreeActivities
    }));

    // Determine main activity
    let newMainId = mainActivityId;
    if (newSelectedActivities.length > 0 && !newMainId) {
      newMainId = newSelectedActivities[0].id;
    } else if (!newSelectedActivities.some(a => a.id === newMainId)) {
      newMainId = newSelectedActivities[0]?.id || null;
    }

    onDataChange({
      business_activities: newSelectedActivities,
      main_activity_id: newMainId
    });
  };

  // Debounced validation to prevent infinite loops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const errors: string[] = [];
      
      if (selectedActivities.length === 0) {
        errors.push('Please select at least one business activity');
      }
      
      if (selectedActivities.length > 0 && !mainActivityId) {
        errors.push('Please select a main business activity');
      }
      
      onValidationChange({
        valid: errors.length === 0,
        errors
      });
    }, 100); // 100ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [selectedActivities.length, mainActivityId]);

  // Convert SelectedActivity back to BusinessActivity for the selector
  const selectedBusinessActivities = selectedActivities.map(selected => 
    availableActivities.find(activity => activity.id === selected.id)
  ).filter(Boolean) as BusinessActivity[];

  if (isLoading) {
    return (
      <FormStep 
        title="Loading..." 
        subtitle="Fetching business activities"
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </FormStep>
    );
  }

  return (
    <FormStep 
      title="What does your company do?" 
      subtitle={`Search and select your business activities. First ${maxFreeActivities} are free.`}
    >
      {/* Selected Activities Summary */}
      {selectedActivities.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-accent/5 to-background/80 rounded-xl border border-accent/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Selected Activities ({selectedActivities.length})</h3>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {Math.min(selectedActivities.length, maxFreeActivities)} Free
              </Badge>
              {selectedActivities.length > maxFreeActivities && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {selectedActivities.length - maxFreeActivities} Paid
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {selectedActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  {activity.is_main && <Badge variant="default" className="text-xs">Main</Badge>}
                  <span className="text-sm font-medium">{activity.activity_name}</span>
                  <Badge variant="outline" className="text-xs">{activity.activity_code}</Badge>
                </div>
                {!activity.is_main && selectedActivities.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updatedActivities = selectedActivities.map(a => ({
                        ...a,
                        is_main: a.id === activity.id
                      }));
                      onDataChange({
                        business_activities: updatedActivities,
                        main_activity_id: activity.id
                      });
                    }}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Set as Main
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Searchable Selector */}
      <SearchableSelector
        items={availableActivities}
        selectedItems={selectedBusinessActivities}
        searchPlaceholder="Type what your business does..."
        onSelectionChange={handleSelectionChange}
        getItemId={(activity) => activity.id}
        getItemLabel={(activity) => activity.activity_name}
        getItemDescription={(activity) => activity.activity_description}
        renderItem={(activity, isSelected) => (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base md:text-lg font-medium">{activity.activity_name}</span>
              <Badge variant="outline" className="text-xs">{activity.activity_code}</Badge>
              {activity.activity_type && (
                <Badge variant="secondary" className="text-xs">{activity.activity_type}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {activity.activity_description}
            </p>
          </div>
        )}
      />
      
      {/* Help Text */}
      {selectedActivities.length > maxFreeActivities && (
        <p className="text-center text-sm text-muted-foreground">
          Additional activities beyond the first {maxFreeActivities} may incur extra fees.
        </p>
      )}
    </FormStep>
  );
}

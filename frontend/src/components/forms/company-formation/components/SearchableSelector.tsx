'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Search, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface SearchableSelectorProps<T> {
  items: T[];
  selectedItems: T[];
  searchPlaceholder: string;
  onSelectionChange: (items: T[]) => void;
  onSearch?: (query: string) => void;
  getItemId: (item: T) => string | number;
  getItemLabel: (item: T) => string;
  getItemDescription?: (item: T) => string;
  renderItem?: (item: T, isSelected: boolean) => ReactNode;
  maxSelections?: number;
  searchDelay?: number;
  className?: string;
}

/**
 * High-level SearchableSelector that maintains existing design patterns
 * Provides the search input styling and selection card layout
 */
export function SearchableSelector<T>({
  items,
  selectedItems,
  searchPlaceholder,
  onSelectionChange,
  onSearch,
  getItemId,
  getItemLabel,
  getItemDescription,
  renderItem,
  maxSelections,
  searchDelay = 300,
  className = ''
}: SearchableSelectorProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      } else {
        // Default local filtering
        const filtered = items.filter(item => 
          getItemLabel(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (getItemDescription && getItemDescription(item).toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredItems(filtered);
      }
    }, searchDelay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, items, onSearch, getItemLabel, getItemDescription, searchDelay]);

  // Update filtered items when items change
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items);
    }
  }, [items, searchTerm]);

  const toggleSelection = (item: T) => {
    const itemId = getItemId(item);
    const isSelected = selectedItems.some(selected => getItemId(selected) === itemId);
    
    if (isSelected) {
      // Remove item
      const newSelection = selectedItems.filter(selected => getItemId(selected) !== itemId);
      onSelectionChange(newSelection);
    } else {
      // Add item (if under max limit)
      if (!maxSelections || selectedItems.length < maxSelections) {
        onSelectionChange([...selectedItems, item]);
      }
    }
  };

  const isSelected = (item: T) => {
    const itemId = getItemId(item);
    return selectedItems.some(selected => getItemId(selected) === itemId);
  };

  const canSelect = (item: T) => {
    return isSelected(item) || !maxSelections || selectedItems.length < maxSelections;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Input - matches existing form input styling */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 md:h-14 text-base md:text-lg rounded-xl border-2 focus:border-primary"
        />
      </div>

      {/* Selection Results */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => {
          const selected = isSelected(item);
          const selectable = canSelect(item);
          
          return (
            <div
              key={getItemId(item)}
              className={`
                flex items-center space-x-4 p-4 md:p-6 rounded-xl border-2 transition-all duration-300 
                ${selectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 
                ${selected
                  ? "border-accent bg-gradient-to-r from-accent/5 to-background/80"
                  : "border-border bg-background/50"
                }
              `}
              onClick={() => selectable && toggleSelection(item)}
            >
              {/* Selection Indicator */}
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${selected 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground/30'
                }
              `}>
                {selected && <Check className="h-4 w-4 text-white" />}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                {renderItem ? (
                  renderItem(item, selected)
                ) : (
                  <>
                    <Label className="text-base md:text-lg font-medium cursor-pointer">
                      {getItemLabel(item)}
                    </Label>
                    {getItemDescription && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {getItemDescription(item)}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? `No results found for "${searchTerm}"` : 'No items available'}
          </p>
          {searchTerm && (
            <Button
              variant="link"
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

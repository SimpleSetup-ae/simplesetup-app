'use client'

import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  singularUnit?: string;
  pluralUnit?: string;
  description?: string;
  className?: string;
}

/**
 * High-level NumberStepper that matches the existing stepper design
 * Maintains the border styling and button layout
 */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
  singularUnit = 'item',
  pluralUnit,
  description,
  className = ''
}: NumberStepperProps) {
  const unit = value === 1 ? singularUnit : (pluralUnit || `${singularUnit}s`);
  
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };
  
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div>
          <Label className="text-base font-medium">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      
      {/* Stepper - matches existing design exactly */}
      <div className="flex items-center space-x-4 p-4 md:p-6 border rounded-lg bg-muted/30 max-w-md mx-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="text-center min-w-[80px]">
          <div className="text-xl md:text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{unit}</div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

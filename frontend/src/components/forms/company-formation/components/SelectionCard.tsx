'use client'

import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface SelectionCardProps {
  id: string;
  label: string;
  description?: string;
  selected?: boolean;
  onClick: () => void;
  children?: ReactNode;
  className?: string;
}

/**
 * High-level SelectionCard that matches the existing beautiful card design
 * Maintains the gradient hover effects and consistent styling
 */
export function SelectionCard({ 
  id, 
  label, 
  description, 
  selected = false, 
  onClick, 
  children,
  className = '' 
}: SelectionCardProps) {
  return (
    <div
      className={`
        flex items-center space-x-4 p-4 md:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer 
        hover:bg-gradient-to-r hover:from-accent/8 hover:to-background/80 hover:border-accent/50 
        ${selected
          ? "border-accent bg-gradient-to-r from-accent/5 to-background/80"
          : "border-border bg-background/50"
        }
        ${className}
      `}
      onClick={onClick}
    >
      <div className={`
        w-4 h-4 rounded-full border-2 flex items-center justify-center
        ${selected ? 'border-primary bg-primary' : 'border-muted-foreground'}
      `}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <Label
          htmlFor={id}
          className="flex-1 text-base md:text-lg font-medium cursor-pointer"
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

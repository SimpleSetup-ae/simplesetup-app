'use client'

import { ReactNode } from 'react'
import { Background } from '@/components/ui/background-dots-masked'

interface FormStepProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}

/**
 * High-level FormStep component that maintains the existing design language
 * Provides the beautiful card layout with backdrop blur and consistent spacing
 */
export function FormStep({ title, subtitle, children, className = '' }: FormStepProps) {
  return (
    <>
      {/* Consistent header matching existing design */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-3">
          {title}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {subtitle}
        </p>
      </div>

      {/* Content in the signature card style */}
      <div className={`space-y-6 ${className}`}>
        {children}
      </div>
    </>
  );
}

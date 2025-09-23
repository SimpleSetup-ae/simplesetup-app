'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  titleLevel?: 'h2' | 'h3' | 'h4'
  headerActions?: ReactNode
}

export function FormSection({
  title,
  description,
  children,
  className = '',
  titleLevel = 'h2',
  headerActions
}: FormSectionProps) {
  const titleClasses = {
    h2: 'font-lora text-2xl font-semibold text-gray-900',
    h3: 'font-lora text-xl font-medium text-gray-900', 
    h4: 'font-lora text-lg font-medium text-gray-900'
  }

  const TitleComponent = titleLevel

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className={titleClasses[titleLevel]}>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-gray-600 text-base">
                {description}
              </CardDescription>
            )}
          </div>
          {headerActions && (
            <div className="ml-4">
              {headerActions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  )
}

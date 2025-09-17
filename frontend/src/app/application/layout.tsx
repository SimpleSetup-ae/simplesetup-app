'use client'

import { ApplicationProvider } from '@/contexts/ApplicationContext'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApplicationProvider>
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        }
      >
        {children}
      </Suspense>
    </ApplicationProvider>
  )
}

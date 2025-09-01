'use client'

import { ReactNode } from 'react'
import Sidebar from './sidebar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function DashboardLayout({ children, title = "Dashboard", description }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-full" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                asChild
              >
                <Link href="/companies/new">
                  <Plus className="h-4 w-4" />
                  New Company
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="gap-2"
                asChild
              >
                <Link href="/documents">
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </Link>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
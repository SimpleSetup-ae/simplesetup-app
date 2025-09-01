'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  LayoutDashboard, 
  Plane, 
  Calculator, 
  Users, 
  Settings, 
  Plus,
  LogOut
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'My Company', 
    href: '/companies',
    icon: Building2
  },
  {
    title: 'Visas',
    href: '/visas',
    icon: Plane
  },
  {
    title: 'Accounting',
    href: '/accounting',
    icon: Calculator
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

// Mock companies data - in production this would come from API
const companies = [
  {
    id: '1',
    name: 'Sample Tech Solutions LLC',
    free_zone: 'IFZA',
    status: 'in_progress'
  },
  {
    id: '2', 
    name: 'Digital Marketing Co.',
    free_zone: 'DIFC',
    status: 'completed'
  }
]

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={`flex flex-col h-full bg-white border-r ${className}`}>
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="text-2xl font-merriweather font-bold text-orange-500">
            SimpleSetup.ae
          </div>
        </Link>
      </div>

      {/* Company Selector */}
      <div className="px-4 mb-6">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Company</div>
          <Select defaultValue="1">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-xs text-gray-500">
                      {company.free_zone} • {company.status.replace('_', ' ')}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            asChild
          >
            <Link href="/companies/new">
              <Plus className="h-4 w-4" />
              Add Company
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="mx-4" />

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-900'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      <Separator className="mx-4" />

      {/* Bottom Section - Logout */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => {
            // In production, this would call Clerk's signOut
            alert('Logout functionality - would integrate with Clerk')
          }}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  )
}

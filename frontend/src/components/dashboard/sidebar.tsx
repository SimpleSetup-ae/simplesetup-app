'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/auth/auth-provider'
import { 
  Building2, 
  LayoutDashboard, 
  Plane, 
  Calculator, 
  Users, 
  Settings,
  LogOut,
  FileText
} from 'lucide-react'

function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      onClick={signOut}
    >
      <LogOut className="h-4 w-4" />
      Log Out
    </Button>
  )
}

interface SidebarProps {
  className?: string
}

// Regular user menu items
const regularMenuItems = [
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
    title: 'Requests',
    href: '/requests',
    icon: FileText
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

// Admin menu items
const adminMenuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Applications',
    href: '/admin/applications',
    icon: FileText
  },
  {
    title: 'Companies',
    href: '/admin/companies',
    icon: Building2
  },
  {
    title: 'Users',
    href: '/admin/users',
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
  const { user } = useAuth()
  
  // Determine which menu items to show based on user role
  const menuItems = user?.isAdmin ? adminMenuItems : regularMenuItems

  return (
    <div className={`flex flex-col h-full bg-white border-r ${className}`}>
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="text-2xl font-lora font-bold text-orange-500">
            SimpleSetup.ae
          </div>
        </Link>
      </div>

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

      {/* Bottom Section - Company Selector and Logout (locked at bottom) */}
      <div className="mt-auto">
        {/* Company Selector - Text directly on background */}
        <div className="px-4 mb-6">
          <div 
            className="relative rounded-xl p-4"
            style={{
              backgroundImage: `url('/images/orange-gradient-bg.svg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Very light wash effect */}
            <div className="absolute inset-0 bg-white/15 rounded-xl"></div>
            
            {/* Content directly on background */}
            <div className="relative z-10">
              <Select defaultValue="1">
                <SelectTrigger className="w-full bg-transparent border-white/40 text-gray-800 hover:border-white/60 transition-all backdrop-blur-sm">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium text-gray-900">{company.name}</span>
                        <span className="text-xs text-gray-600">
                          {company.free_zone} • {company.status.replace('_', ' ')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
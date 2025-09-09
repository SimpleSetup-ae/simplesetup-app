import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Simple Setup Corporate Tax Registration Agent
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          A comprehensive UAE company formation SaaS platform with multi-app architecture, 
          automation workflows, and AI-powered document processing.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 Company Formation
              </CardTitle>
              <CardDescription>
                Streamlined company formation process with YAML-driven workflows 
                and automated document processing.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📄 Document Processing
              </CardTitle>
              <CardDescription>
                AI-powered OCR and document extraction using Google Gemini 2.5 Pro 
                and OpenAI GPT-4o integration.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Automation
              </CardTitle>
              <CardDescription>
                Playwright automation workers for government portals and 
                third-party service integration.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        <div className="mt-12 space-y-8">
          {/* Main CTA Buttons */}
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>

          {/* Test User Accounts */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">🧪 Test User Accounts</CardTitle>
              <CardDescription className="text-center">
                Quick access to test different user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    role: 'Company Owner',
                    email: 'owner@sampletech.com',
                    description: 'Full access to all features, company management, financial data',
                    color: 'bg-purple-100 text-purple-800 border-purple-200',
                    href: '/dashboard?user=owner'
                  },
                  {
                    role: 'Admin',
                    email: 'admin@sampletech.com', 
                    description: 'Manage workflows, documents, users. Limited financial access',
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    href: '/dashboard?user=admin'
                  },
                  {
                    role: 'Accountant',
                    email: 'accountant@sampletech.com',
                    description: 'Tax registrations, financial reports, payment history access',
                    color: 'bg-green-100 text-green-800 border-green-200', 
                    href: '/dashboard?user=accountant'
                  },
                  {
                    role: 'Viewer',
                    email: 'viewer@sampletech.com',
                    description: 'Read-only access to company info, documents, progress',
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    href: '/dashboard?user=viewer'
                  },
                  {
                    role: 'CSP Admin',
                    email: 'csp@simplesetup.ae',
                    description: 'Review applications, approve requests, manage all companies',
                    color: 'bg-orange-100 text-orange-800 border-orange-200',
                    href: '/dashboard?user=csp_admin'
                  },
                  {
                    role: 'Super Admin',
                    email: 'superadmin@simplesetup.ae',
                    description: 'System administration, user management, platform settings',
                    color: 'bg-red-100 text-red-800 border-red-200',
                    href: '/dashboard?user=super_admin'
                  }
                ].map((userType) => (
                  <Card key={userType.role} className={`transition-all hover:shadow-md border ${userType.color}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{userType.role}</CardTitle>
                      <CardDescription className="text-xs">
                        {userType.email}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{userType.description}</p>
                      <Button asChild size="sm" className="w-full">
                        <Link href={userType.href}>
                          Test as {userType.role}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Each test account shows different UI elements and permissions based on the user role.
                </p>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/dashboard">
                    <Building2 className="h-4 w-4" />
                    Access Full Demo Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-green-600">✅ Development Environment Ready!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold">Backend (Rails API)</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">localhost:3001</code>
                </div>
                <div className="text-center">
                  <p className="font-semibold">Frontend (Next.js)</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">localhost:3000</code>
                </div>
                <div className="text-center">
                  <p className="font-semibold">PostgreSQL</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">localhost:5432</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">🚀 Phase 1 Progress</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">✅ Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Complete monorepo structure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Rails API with PostgreSQL
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    YAML-driven workflow engine
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Database models and migrations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Core API endpoints
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">🔄 Next Up</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Clerk authentication setup
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Design system with gradients
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Document OCR pipeline
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Frontend-backend integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Payment processing (Stripe)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import Link from 'next/link'

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
        
        <div className="mt-12 space-y-6">
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
          
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
  )
}

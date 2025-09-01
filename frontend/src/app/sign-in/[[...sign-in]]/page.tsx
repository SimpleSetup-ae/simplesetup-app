import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            Sign In
          </CardTitle>
          <CardDescription>
            Access your company formation dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Mode</h3>
            <p className="text-blue-800 text-sm mb-4">
              Clerk authentication is ready but requires API keys. 
              For testing, you can access the demo dashboard directly.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Access Demo Dashboard</Link>
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-orange-600 hover:text-orange-700">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

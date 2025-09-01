import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            Get Started
          </CardTitle>
          <CardDescription>
            Start your UAE company formation journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Ready to Test!</h3>
            <p className="text-green-800 text-sm mb-4">
              The complete company formation system is ready for testing. 
              Explore the demo to see the full workflow.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
              <Link href="/companies/new">Start Company Formation</Link>
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-orange-600 hover:text-orange-700">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

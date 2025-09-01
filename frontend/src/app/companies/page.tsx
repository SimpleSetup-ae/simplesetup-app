import Sidebar from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Temporarily disable auth check for testing
export default async function CompaniesPage() {

  // In production, this would fetch companies from the API
  const companies = [
    {
      id: '1',
      name: 'Sample Tech Solutions LLC',
      free_zone: 'IFZA',
      status: 'in_progress',
      formation_progress: 60,
      created_at: '2024-01-15T10:00:00Z'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-full" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Companies</h1>
          <p className="text-gray-600">Manage your company formations and licenses</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
          <Link href="/companies/new">Create Company</Link>
        </Button>
      </div>
      
      {companies.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Companies Yet</CardTitle>
            <CardDescription>
              Start your UAE company formation journey by creating your first company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
              <Link href="/companies/new">Create Your First Company</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {company.free_zone} • Created {new Date(company.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      company.status === 'completed' ? 'bg-green-100 text-green-800' :
                      company.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {company.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Formation Progress</span>
                      <span>{company.formation_progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-gray-400 h-2 rounded-full transition-all"
                        style={{ width: `${company.formation_progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/companies/${company.id}`}>View Details</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/companies/${company.id}/workflow`}>Continue Formation</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/companies/${company.id}/documents`}>Documents</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  )
}

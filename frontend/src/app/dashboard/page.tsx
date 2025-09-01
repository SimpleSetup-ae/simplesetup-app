import Sidebar from '../../components/dashboard/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Plus, Upload, Calculator } from 'lucide-react'

// Temporarily disable auth check for testing
export default async function DashboardPage() {
  // Mock data - in production this would come from API
  const dashboardData = {
    stats: {
      total_companies: 2,
      in_progress: 1,
      completed: 1,
      documents_pending: 3,
      payments_due: 1
    },
    recent_activities: [
      {
        id: '1',
        type: 'company_created',
        company: 'Sample Tech Solutions LLC',
        description: 'Company formation started',
        timestamp: '2024-01-15T10:00:00Z',
        status: 'in_progress'
      },
      {
        id: '2',
        type: 'document_uploaded',
        company: 'Digital Marketing Co.',
        description: 'Passport copy uploaded',
        timestamp: '2024-01-15T09:30:00Z',
        status: 'completed'
      },
      {
        id: '3',
        type: 'payment_received',
        company: 'Digital Marketing Co.',
        description: 'Formation fees paid (3,000 AED)',
        timestamp: '2024-01-14T14:20:00Z',
        status: 'completed'
      }
    ]
  }

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-full" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area - No top bar */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.stats.total_companies}</div>
                  <p className="text-xs text-muted-foreground">
                    +1 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{dashboardData.stats.in_progress}</div>
                  <p className="text-xs text-muted-foreground">
                    Active formations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardData.stats.completed}</div>
                  <p className="text-xs text-muted-foreground">
                    Issued licenses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{dashboardData.stats.documents_pending}</div>
                  <p className="text-xs text-muted-foreground">
                    Documents & payments
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Button asChild className="justify-start gap-2 h-auto p-4 bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                    <Link href="/companies/new">
                      <Building2 className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Start New Company Formation</div>
                        <div className="text-sm opacity-90">Begin the IFZA formation process</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="justify-start gap-2 h-auto p-4">
                    <Link href="/documents">
                      <FileText className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Upload Documents</div>
                        <div className="text-sm text-muted-foreground">Add required formation documents</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="justify-start gap-2 h-auto p-4">
                    <Link href="/accounting">
                      <Calculator className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Tax Registration</div>
                        <div className="text-sm text-muted-foreground">Register for Corporate Tax & VAT</div>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates across your companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recent_activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'in_progress' ? 'bg-orange-500' :
                          'bg-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.company} • {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                    <Link href="/activity">View All Activity</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Formation Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Formation Progress Overview
                </CardTitle>
                <CardDescription>
                  Track progress across all your company formations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{company.name}</h4>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            company.status === 'completed' ? 'bg-green-100 text-green-800' :
                            company.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {company.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{company.free_zone}</span>
                          <span>•</span>
                          <span>
                            {company.status === 'completed' ? '100%' : 
                             company.status === 'in_progress' ? '60%' : '0%'} complete
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/companies/${company.id}`}>View</Link>
                        </Button>
                        {company.status === 'in_progress' && (
                          <Button size="sm" asChild>
                            <Link href={`/companies/${company.id}/workflow`}>Continue</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
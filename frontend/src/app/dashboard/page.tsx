// Dashboard content will be wrapped by layout.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { 
  Building2, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Calculator,
  Users,
  Calendar,
  Download,
  Shield,
  Timer,
  AlertTriangle,
  Bell
} from 'lucide-react'

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
      trade_name: 'Sample Tech',
      free_zone: 'IFZA',
      status: 'issued',
      license_number: 'IFZA-2024-001234',
      formation_progress: 100,
      license_renewal_date: '2025-01-15',
      shareholders: [
        {
          id: '1',
          full_name: 'John Smith',
          type: 'shareholder',
          share_percentage: 60,
          passport_number: 'A1234567',
          passport_expiry_date: '2025-06-15',
          expiry_status: 'warning'
        },
        {
          id: '2',
          full_name: 'Jane Doe',
          type: 'director',
          share_percentage: 40,
          emirates_id: '784-1234-5678901-2',
          emirates_id_expiry_date: '2026-03-20',
          expiry_status: 'valid'
        }
      ],
      documents: {
        trade_license: 'https://example.com/trade-license.pdf',
        moa: 'https://example.com/moa.pdf'
      }
    },
    {
      id: '2', 
      name: 'Digital Marketing Co.',
      free_zone: 'DIFC',
      status: 'in_progress',
      formation_progress: 60,
      shareholders: [
        {
          id: '3',
          full_name: 'Ahmed Al-Rashid',
          type: 'shareholder',
          share_percentage: 100,
          passport_number: 'B9876543',
          passport_expiry_date: '2024-12-30',
          expiry_status: 'critical'
        }
      ],
      documents: {}
    }
  ]

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'Passport Expiry Warning',
      message: 'John Smith\'s passport expires in 45 days. Please renew to avoid issues.',
      type: 'warning',
      company_name: 'Sample Tech Solutions LLC',
      created_at: '2024-01-10T10:00:00Z',
      read: false
    },
    {
      id: '2', 
      title: 'Document Verification Complete',
      message: 'All submitted documents have been verified successfully.',
      type: 'success',
      company_name: 'Digital Marketing Co.',
      created_at: '2024-01-09T10:00:00Z',
      read: false
    },
    {
      id: '3',
      title: 'Urgent: Passport Expires Soon',
      message: 'Ahmed Al-Rashid\'s passport expires in 15 days. Immediate action required.',
      type: 'error',
      company_name: 'Digital Marketing Co.',
      created_at: '2024-01-08T10:00:00Z',
      read: false
    }
  ]

  return (
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
                    <Link href={`/companies/${company.id}`}>View Details</Link>
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

      {/* Client-Specific Sections - Show detailed info for each company */}
      {companies.map((company) => (
        <div key={`details-${company.id}`} className="space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold">{company.name}</h2>
            {company.license_number && (
              <Badge variant="outline">{company.license_number}</Badge>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Official Documents
                </CardTitle>
                <CardDescription>
                  Access your company formation documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.documents?.trade_license ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">Trade License</p>
                        <p className="text-sm text-gray-600">Official business license</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={company.documents.trade_license} target="_blank">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-600">Trade License</p>
                        <p className="text-sm text-gray-500">Pending issuance</p>
                      </div>
                    </div>
                  </div>
                )}

                {company.documents?.moa ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Memorandum of Association</p>
                        <p className="text-sm text-gray-600">Company constitution</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={company.documents.moa} target="_blank">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-600">Memorandum of Association</p>
                        <p className="text-sm text-gray-500">Being prepared</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* License Renewal Timer */}
            {company.license_renewal_date && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    License Renewal
                  </CardTitle>
                  <CardDescription>
                    Track your license renewal deadline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600">
                      {Math.ceil((new Date(company.license_renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <p className="text-gray-600">days until renewal</p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Renewal Date:</strong> {new Date(company.license_renewal_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Shareholders & Directors */}
          {company.shareholders && company.shareholders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Shareholders & Directors
                </CardTitle>
                <CardDescription>
                  Company ownership and management structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {company.shareholders.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{person.full_name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {person.type.charAt(0).toUpperCase() + person.type.slice(1)}
                          </Badge>
                          {person.share_percentage && (
                            <Badge variant="secondary" className="text-xs">
                              {person.share_percentage}% Share
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              <strong>
                                {person.passport_number ? 'Passport' : 'Emirates ID'}:
                              </strong> {person.passport_number || person.emirates_id}
                            </span>
                            {(person.passport_expiry_date || person.emirates_id_expiry_date) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires: {new Date(person.passport_expiry_date || person.emirates_id_expiry_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Badge className={`text-xs ${
                            person.expiry_status === 'expired' ? 'bg-red-100 text-red-800' :
                            person.expiry_status === 'critical' ? 'bg-red-100 text-red-800' :
                            person.expiry_status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {person.expiry_status === 'expired' && 'Expired'}
                            {person.expiry_status === 'critical' && 'Expires Soon'}
                            {person.expiry_status === 'warning' && 'Expiring in 3 months'}
                            {person.expiry_status === 'valid' && 'Valid'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Important updates and reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                  {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                  {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                  {notification.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {notification.company_name} • {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

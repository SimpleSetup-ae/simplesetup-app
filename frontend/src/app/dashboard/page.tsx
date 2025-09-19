'use client'

// Dashboard content will be wrapped by layout.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Building2, FileText, Clock, CheckCircle, AlertCircle, Download, Users, Calendar, ExternalLink } from 'lucide-react'
import { fetchDashboardData, type DashboardData } from '@/lib/api'
import { Suspense, useEffect, useState } from 'react'

// Company Owner Dashboard Component
function CompanyOwnerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const data = await fetchDashboardData()
        setDashboardData(data)
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return <DashboardLoading />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!dashboardData) {
    return <DashboardLoading />
  }
  
  // If no companies, show empty state
  if (dashboardData.companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Building2 className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Yet</h3>
        <p className="text-gray-600 mb-6">Get started by creating your first company formation.</p>
        <Button asChild>
          <Link href="/companies/new">
            <Building2 className="h-4 w-4 mr-2" />
            Start Company Formation
          </Link>
        </Button>
      </div>
    )
  }
  
  // Get the primary company (first one for now - could be enhanced with selection)
  const company = dashboardData.companies[0]
  
  return (
    <div className="space-y-6">
      {/* Company Information Slab */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">{company.name}</CardTitle>
              {company.trade_name && (
                <p className="text-sm text-gray-600 mt-1">Trading as: {company.trade_name}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={company.status === 'issued' ? 'default' : company.status === 'in_progress' ? 'secondary' : 'outline'}>
                  {company.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">{company.free_zone}</span>
                {company.license_number && (
                  <span className="text-sm text-gray-600">License: {company.license_number}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{company.formation_progress}%</div>
              <div className="text-sm text-gray-600">Formation Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-600">{company.official_email || 'Not set'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <p className="text-gray-600">{company.phone || 'Not set'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Website:</span>
              <p className="text-gray-600">
                {company.website ? (
                  <Link href={company.website} target="_blank" className="text-orange-600 hover:underline inline-flex items-center gap-1">
                    {company.website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : 'Not set'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Key Documents
            </CardTitle>
            <CardDescription>
              Access your important company documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'trade_license', label: 'Trade License', doc: company.documents?.trade_license },
              { key: 'moa', label: 'Memorandum of Association (MOA)', doc: company.documents?.moa },
              { key: 'certificate_of_incorporation', label: 'Certificate of Incorporation', doc: company.documents?.certificate_of_incorporation },
              { key: 'commercial_license', label: 'Commercial License', doc: company.documents?.commercial_license }
            ].map(({ key, label, doc }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    {doc && (
                      <p className="text-xs text-gray-600">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        {doc.verified && <span className="text-green-600 ml-2">✓ Verified</span>}
                      </p>
                    )}
                  </div>
                </div>
                {doc ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={doc.download_url}>
                      <Download className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-gray-500">Not Available</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shareholders & Directors */}
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
          <CardContent className="space-y-4">
            {company.shareholders && company.shareholders.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Shareholders</h4>
                <div className="space-y-2">
                  {company.shareholders.map((shareholder) => (
                    <div key={shareholder.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{shareholder.full_name}</p>
                        <p className="text-xs text-gray-600">
                          {shareholder.identification_type}: {shareholder.identification_number}
                          {shareholder.passport_expiry_date && (
                            <span className="ml-2">
                              • Expires: {new Date(shareholder.passport_expiry_date).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      {shareholder.share_percentage && (
                        <Badge variant="secondary">{shareholder.share_percentage}%</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {company.directors && company.directors.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Directors</h4>
                <div className="space-y-2">
                  {company.directors.map((director) => (
                    <div key={director.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{director.full_name}</p>
                        <p className="text-xs text-gray-600">
                          {director.identification_type}: {director.identification_number}
                          {director.passport_expiry_date && (
                            <span className="ml-2">
                              • Expires: {new Date(director.passport_expiry_date).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Important updates and reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboardData.notifications || dashboardData.notifications.length === 0 ? (
              <p className="text-gray-600 text-sm">No notifications at this time.</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.urgency === 'critical' ? 'bg-red-500' :
                      notification.urgency === 'high' ? 'bg-orange-500' :
                      notification.urgency === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* License Renewal Timer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              License Renewal
            </CardTitle>
            <CardDescription>
              Track your license expiry dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {company.license_expiry_date ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {company.license_renewal_days || 0}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Days until license renewal
                </div>
                <div className="text-xs text-gray-500">
                  License expires: {new Date(company.license_expiry_date).toLocaleDateString()}
                </div>
                {company.license_renewal_days && company.license_renewal_days <= 60 && (
                  <div className="mt-4">
                    <Badge variant={company.license_renewal_days <= 30 ? 'destructive' : 'secondary'}>
                      {company.license_renewal_days <= 30 ? 'Renewal Due Soon' : 'Renewal Reminder'}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">License expiry date not set</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href={`/companies/${company.id}`}>
                <div className="text-center">
                  <Building2 className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">View Company Details</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href={`/companies/${company.id}/documents`}>
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Manage Documents</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/accounting">
                <div className="text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Tax Registration</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading component
function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    </div>
  )
}

// Admin Dashboard Component (blank for now)
function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-6xl mb-4">📊</div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Admin Dashboard</h2>
      <p className="text-gray-600 mb-8">Welcome to the admin dashboard. Analytics and overview coming soon.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">Applications</div>
            <div className="text-xs text-gray-500">Manage applications</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-sm font-medium">Companies</div>
            <div className="text-xs text-gray-500">View formed companies</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Users</div>
            <div className="text-xs text-gray-500">Manage admin users</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Main Dashboard Page with role detection
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  isAdmin?: boolean
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: { user?: string }
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/auth/me', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return <DashboardLoading />
  }

  // Check if user is admin
  if (user?.isAdmin) {
    return <AdminDashboard />
  }
  
  // For regular users, show the company owner dashboard
  return (
    <Suspense fallback={<DashboardLoading />}>
      <CompanyOwnerDashboard />
    </Suspense>
  )
}
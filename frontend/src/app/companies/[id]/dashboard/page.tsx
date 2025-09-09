'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  Users, 
  Calendar,
  ExternalLink,
  Download,
  AlertTriangle,
  Shield,
  Timer
} from 'lucide-react'

interface CompanyDashboard {
  company: {
    id: string
    name: string
    trade_name?: string
    free_zone: string
    status: string
    license_number?: string
    formation_progress: number
    status_display: string
    progress_percentage: number
    license_issued_at?: string
    license_renewal_date?: string
  }
  shareholders: Array<{
    id: string
    full_name: string
    type: string
    share_percentage?: number
    identification: {
      type: string
      number: string
      passport_expiry_date?: string
      emirates_id_expiry_date?: string
    }
    expiry_status: string
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    action_url?: string
    read: boolean
    created_at: string
  }>
  renewal_info?: {
    renewal_date: string
    days_until_renewal: number
    status: string
    urgency: string
  }
  documents: {
    trade_license?: string
    moa?: string
  }
}

export default function CompanyDashboardPage() {
  const params = useParams()
  const companyId = params.id as string
  const [dashboardData, setDashboardData] = useState<CompanyDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [companyId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockData: CompanyDashboard = {
        company: {
          id: companyId,
          name: 'Sample Tech Solutions LLC',
          trade_name: 'Sample Tech',
          free_zone: 'IFZA',
          status: 'issued',
          license_number: 'IFZA-2024-001234',
          formation_progress: 100,
          status_display: 'License Issued - Complete',
          progress_percentage: 100,
          license_issued_at: '2024-01-15T10:00:00Z',
          license_renewal_date: '2025-01-15T10:00:00Z'
        },
        shareholders: [
          {
            id: '1',
            full_name: 'John Smith',
            type: 'shareholder',
            share_percentage: 60,
            identification: {
              type: 'Passport',
              number: 'A1234567',
              passport_expiry_date: '2025-06-15'
            },
            expiry_status: 'warning'
          },
          {
            id: '2',
            full_name: 'Jane Doe',
            type: 'director',
            share_percentage: 40,
            identification: {
              type: 'Emirates ID',
              number: '784-1234-5678901-2',
              emirates_id_expiry_date: '2026-03-20'
            },
            expiry_status: 'valid'
          }
        ],
        notifications: [
          {
            id: '1',
            title: 'Passport Expiry Warning',
            message: 'John Smith\'s passport expires in 45 days. Please renew to avoid issues.',
            type: 'warning',
            action_url: `/companies/${companyId}/people/1`,
            read: false,
            created_at: '2024-01-10T10:00:00Z'
          },
          {
            id: '2',
            title: 'License Renewal Reminder',
            message: 'Your trade license renewal is due in 60 days.',
            type: 'info',
            read: false,
            created_at: '2024-01-09T10:00:00Z'
          }
        ],
        renewal_info: {
          renewal_date: '2025-01-15T10:00:00Z',
          days_until_renewal: 365,
          status: 'normal',
          urgency: 'low'
        },
        documents: {
          trade_license: 'https://example.com/trade-license.pdf',
          moa: 'https://example.com/moa.pdf'
        }
      }
      
      setDashboardData(mockData)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getExpiryStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'valid':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Failed to load dashboard data'}
        </AlertDescription>
      </Alert>
    )
  }

  const { company, shareholders, notifications, renewal_info, documents } = dashboardData

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-600">{company.free_zone} • {company.license_number || 'License Pending'}</p>
        </div>
        <Badge className={`px-3 py-1 text-sm font-medium ${getStatusColor(company.status)}`}>
          {company.status_display}
        </Badge>
      </div>

      {/* Company Status Overview */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Formation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Formation Progress</span>
              <span className="text-sm text-gray-600">{company.progress_percentage}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-gray-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${company.progress_percentage}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-600">Trade Name</p>
                <p className="font-medium">{company.trade_name || 'Same as Company Name'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Free Zone</p>
                <p className="font-medium">{company.free_zone}</p>
              </div>
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
              Official Documents
            </CardTitle>
            <CardDescription>
              Access your company formation documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.trade_license ? (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Trade License</p>
                    <p className="text-sm text-gray-600">Official business license</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={documents.trade_license} target="_blank">
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

            {documents.moa ? (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Memorandum of Association</p>
                    <p className="text-sm text-gray-600">Company constitution</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={documents.moa} target="_blank">
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
        {renewal_info && (
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
                <div className={`text-4xl font-bold ${
                  renewal_info.urgency === 'high' ? 'text-red-600' :
                  renewal_info.urgency === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {renewal_info.days_until_renewal}
                </div>
                <p className="text-gray-600">days until renewal</p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Renewal Date:</strong> {new Date(renewal_info.renewal_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {renewal_info.urgency !== 'low' && (
                    <Button 
                      className="w-full" 
                      variant={renewal_info.urgency === 'high' ? 'destructive' : 'default'}
                    >
                      Start Renewal Process
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
        <CardContent>
          <div className="space-y-4">
            {shareholders.map((person) => (
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
                        <strong>{person.identification.type}:</strong> {person.identification.number}
                      </span>
                      {person.identification.passport_expiry_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(person.identification.passport_expiry_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Badge className={`text-xs ${getExpiryStatusColor(person.expiry_status)}`}>
                      {person.expiry_status === 'expired' && 'Expired'}
                      {person.expiry_status === 'critical' && 'Expires Soon'}
                      {person.expiry_status === 'warning' && 'Expiring in 3 months'}
                      {person.expiry_status === 'valid' && 'Valid'}
                      {person.expiry_status === 'no_document' && 'No Document'}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/companies/${companyId}/people/${person.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
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
                  {getNotificationIcon(notification.type)}
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
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                      {notification.action_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={notification.action_url}>
                            View Details
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href={`/companies/${companyId}/notifications`}>
                View All Notifications
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

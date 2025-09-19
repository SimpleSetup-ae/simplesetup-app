'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Eye, Search, Filter, FileText, Clock, CheckCircle, AlertCircle, XCircle, Building2, User } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  companyName: string
  freeZone: string
  status: string
  submittedAt: string
  userEmail?: string
  userFullName?: string
  isAnonymous: boolean
  packageType?: string
  estimatedAnnualTurnover?: number
  completionPercentage: number
}

interface DetailedApplication extends Application {
  trade_license_validity?: number
  visa_package?: number
  partner_visa_count?: number
  inside_country_visas?: number
  outside_country_visas?: number
  establishment_card?: boolean
  share_capital?: string
  share_value?: string
  name_options?: string[]
  business_activities?: any[]
  main_activity_id?: string
  shareholding_type?: string
  shareholders?: any[]
  directors?: any[]
  general_manager?: any
  gm_signatory_name?: string
  gm_signatory_email?: string
  documents?: any[]
  all_documents?: any[]
  activity_details?: any[]
  owner?: any
}

interface ApplicationStats {
  total: number
  submitted: number
  underReview: number
  approved: number
  rejected: number
}

const statusConfig = {
  'anonymous_draft': { label: 'Anonymous Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  'in_progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  'submitted': { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800', icon: FileText },
  'under_review': { label: 'Under Review', color: 'bg-orange-100 text-orange-800', icon: Clock },
  'information_required': { label: 'Info Required', color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
  'pending_payment': { label: 'Pending Payment', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  'processing': { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Clock },
  'approved': { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  'issued': { label: 'Issued', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'formed': { label: 'Formed', color: 'bg-green-100 text-green-800', icon: Building2 },
  'active': { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [freeZoneFilter, setFreeZoneFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [detailedApplication, setDetailedApplication] = useState<DetailedApplication | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/v1/applications/admin', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      
      if (data.success) {
        setApplications(data.applications)
        
        // Calculate stats from real data
        const stats = {
          total: data.applications.length,
          submitted: data.applications.filter((app: Application) => app.status === 'submitted').length,
          underReview: data.applications.filter((app: Application) => app.status === 'under_review').length,
          approved: data.applications.filter((app: Application) => ['approved', 'formed', 'active'].includes(app.status)).length,
          rejected: data.applications.filter((app: Application) => app.status === 'rejected').length,
        }
        setStats(stats)
      } else {
        throw new Error(data.message || 'Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      // Set empty state on error
      setApplications([])
      setStats({ total: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0 })
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      setLoadingDetails(true)
      const response = await fetch(`http://localhost:3001/api/v1/applications/admin/${applicationId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch application details')
      }

      const data = await response.json()
      
      if (data.success) {
        setDetailedApplication(data.application)
      } else {
        throw new Error(data.message || 'Failed to fetch application details')
      }
    } catch (error) {
      console.error('Error fetching application details:', error)
      setDetailedApplication(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.userEmail && app.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (app.userFullName && app.userFullName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesFreeZone = freeZoneFilter === 'all' || app.freeZone === freeZoneFilter
    
    return matchesSearch && matchesStatus && matchesFreeZone
  })

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/applications/admin/${applicationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notify_client: true
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('Application status updated successfully')
        await fetchApplications()
      } else {
        throw new Error(data.message || 'Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Applications" description="Manage all company formation applications">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Applications" description="Manage all company formation applications">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.underReview}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by company name, user email, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="information_required">Info Required</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={freeZoneFilter} onValueChange={setFreeZoneFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by free zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Free Zones</SelectItem>
                  <SelectItem value="IFZA">IFZA</SelectItem>
                  <SelectItem value="DIFC">DIFC</SelectItem>
                  <SelectItem value="JAFZA">JAFZA</SelectItem>
                  <SelectItem value="ADGM">ADGM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Free Zone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => {
                    const statusInfo = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.draft
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{app.companyName}</div>
                            {app.estimatedAnnualTurnover && (
                              <div className="text-sm text-gray-500">
                                Turnover: AED {app.estimatedAnnualTurnover.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.isAnonymous ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-500">Anonymous</span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">{app.userFullName}</div>
                              <div className="text-sm text-gray-500">{app.userEmail}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{app.freeZone}</TableCell>
                        <TableCell>{app.packageType || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${app.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{app.completionPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplication(app)
                                    fetchApplicationDetails(app.id)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Application Details - {selectedApplication?.companyName}</DialogTitle>
                                </DialogHeader>
                                {loadingDetails ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2">Loading application details...</span>
                                  </div>
                                ) : detailedApplication ? (
                                  <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Basic Information</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Company Name (First Choice)</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.name_options?.[0] || detailedApplication.companyName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Free Zone</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.freeZone}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Status</label>
                                          <Badge className={statusConfig[detailedApplication.status as keyof typeof statusConfig]?.color}>
                                            {statusConfig[detailedApplication.status as keyof typeof statusConfig]?.label}
                                          </Badge>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Submitted Date</label>
                                          <p className="text-sm text-gray-900">
                                            {detailedApplication.submittedAt 
                                              ? new Date(detailedApplication.submittedAt).toLocaleDateString()
                                              : 'Not submitted yet'
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Client Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Client Information</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        {!detailedApplication.isAnonymous && detailedApplication.owner ? (
                                          <>
                                            <div>
                                              <label className="text-sm font-medium text-gray-700">Full Name</label>
                                              <p className="text-sm text-gray-900">{detailedApplication.owner.fullName}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-700">Email Address</label>
                                              <p className="text-sm text-gray-900">{detailedApplication.owner.email}</p>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="col-span-2">
                                            <div className="flex items-center gap-2 text-gray-500">
                                              <User className="h-4 w-4" />
                                              <span>Anonymous Application</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Package & Licensing */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Package & Licensing</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Trade License Validity</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.trade_license_validity} year(s)</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Total Visas</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.visa_package} visa(s)</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Inside UAE Visas</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.inside_country_visas || 0} visa(s)</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Outside UAE Visas</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.outside_country_visas || 0} visa(s)</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Partner Visas</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.partner_visa_count || 0} visa(s)</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Establishment Card</label>
                                          <p className="text-sm text-gray-900">{detailedApplication.establishment_card ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Share Capital</label>
                                          <p className="text-sm text-gray-900">AED {parseFloat(detailedApplication.share_capital || '0').toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Share Value</label>
                                          <p className="text-sm text-gray-900">AED {parseFloat(detailedApplication.share_value || '0').toLocaleString()}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Company Names */}
                                    {detailedApplication.name_options && detailedApplication.name_options.length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Company Name Options</h3>
                                        <div className="space-y-2">
                                          {detailedApplication.name_options.map((name, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                              <p className="text-sm text-gray-900">{name}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Business Activities */}
                                    {detailedApplication.activity_details && detailedApplication.activity_details.length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Business Activities</h3>
                                        <div className="overflow-x-auto">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Activity Name</TableHead>
                                                <TableHead>Activity Code</TableHead>
                                                <TableHead>Description</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {detailedApplication.activity_details.map((activity, index) => (
                                                <TableRow key={index}>
                                                  <TableCell className="font-medium">
                                                    {activity.name || 'Activity Name Not Available'}
                                                  </TableCell>
                                                  <TableCell className="font-mono text-xs">
                                                    {activity.code}
                                                  </TableCell>
                                                  <TableCell className="text-sm">
                                                    {activity.description || 'No description available'}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>
                                    )}

                                    {/* Shareholders */}
                                    {detailedApplication.shareholders && detailedApplication.shareholders.length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Shareholders</h3>
                                        <div className="space-y-4">
                                          {detailedApplication.shareholders.map((shareholder, index) => (
                                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                              <div className="flex items-start gap-4">
                                                {/* Passport Thumbnail */}
                                                {shareholder.passport_file_url && (
                                                  <div className="flex-shrink-0">
                                                    <div className="relative group">
                                                      <img 
                                                        src={shareholder.passport_file_url} 
                                                        alt="Passport" 
                                                        className="w-16 h-20 object-cover border border-gray-300 rounded cursor-pointer hover:opacity-80"
                                                        onClick={() => window.open(shareholder.passport_file_url, '_blank')}
                                                      />
                                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center transition-all">
                                                        <div className="opacity-0 group-hover:opacity-100 text-white text-xs">
                                                          Click to view
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <Button 
                                                      variant="outline" 
                                                      size="sm" 
                                                      className="mt-1 w-full text-xs"
                                                      onClick={() => {
                                                        const link = document.createElement('a')
                                                        link.href = shareholder.passport_file_url
                                                        link.download = `passport_${shareholder.first_name}_${shareholder.last_name}.jpg`
                                                        link.click()
                                                      }}
                                                    >
                                                      Download
                                                    </Button>
                                                  </div>
                                                )}
                                                
                                                {/* Details */}
                                                <div className="flex-1">
                                                  <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Full Name</label>
                                                      <p className="text-sm text-gray-900">{shareholder.first_name} {shareholder.middle_name || ''} {shareholder.last_name}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Share Percentage</label>
                                                      <p className="text-sm text-gray-900">{shareholder.share_percentage}%</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Gender</label>
                                                      <p className="text-sm text-gray-900">{shareholder.gender || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                                                      <p className="text-sm text-gray-900">{shareholder.date_of_birth || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Nationality</label>
                                                      <p className="text-sm text-gray-900">{shareholder.nationality}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Passport Number</label>
                                                      <p className="text-sm text-gray-900">{shareholder.passport_number}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Passport Issue Date</label>
                                                      <p className="text-sm text-gray-900">{shareholder.passport_issue_date || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Passport Expiry Date</label>
                                                      <p className="text-sm text-gray-900">{shareholder.passport_expiry_date || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Issue Country</label>
                                                      <p className="text-sm text-gray-900">{shareholder.passport_issue_country || 'N/A'}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Directors */}
                                    {detailedApplication.directors && detailedApplication.directors.length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Directors</h3>
                                        <div className="space-y-4">
                                          {detailedApplication.directors.map((director, index) => (
                                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                              <div className="flex items-start gap-4">
                                                {/* Passport Thumbnail */}
                                                {director.passport_file_url && (
                                                  <div className="flex-shrink-0">
                                                    <div className="relative group">
                                                      <img 
                                                        src={director.passport_file_url} 
                                                        alt="Passport" 
                                                        className="w-16 h-20 object-cover border border-gray-300 rounded cursor-pointer hover:opacity-80"
                                                        onClick={() => window.open(director.passport_file_url, '_blank')}
                                                      />
                                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center transition-all">
                                                        <div className="opacity-0 group-hover:opacity-100 text-white text-xs">
                                                          Click to view
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <Button 
                                                      variant="outline" 
                                                      size="sm" 
                                                      className="mt-1 w-full text-xs"
                                                      onClick={() => {
                                                        const link = document.createElement('a')
                                                        link.href = director.passport_file_url
                                                        link.download = `passport_${director.first_name}_${director.last_name}.jpg`
                                                        link.click()
                                                      }}
                                                    >
                                                      Download
                                                    </Button>
                                                  </div>
                                                )}
                                                
                                                {/* Details */}
                                                <div className="flex-1">
                                                  <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Full Name</label>
                                                      <p className="text-sm text-gray-900">{director.first_name} {director.middle_name || ''} {director.last_name}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Role</label>
                                                      <p className="text-sm text-gray-900">{director.type}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Gender</label>
                                                      <p className="text-sm text-gray-900">{director.gender || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                                                      <p className="text-sm text-gray-900">{director.date_of_birth || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Nationality</label>
                                                      <p className="text-sm text-gray-900">{director.nationality}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Passport Number</label>
                                                      <p className="text-sm text-gray-900">{director.passport_number}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Passport Issue Date</label>
                                                      <p className="text-sm text-gray-900">{director.passport_issue_date || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Passport Expiry Date</label>
                                                      <p className="text-sm text-gray-900">{director.passport_expiry_date || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500">Issue Country</label>
                                                      <p className="text-sm text-gray-900">{director.passport_issue_country || 'N/A'}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* General Manager */}
                                    {(detailedApplication.general_manager || detailedApplication.gm_signatory_name || detailedApplication.gm_signatory_email) && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900">General Manager</h3>
                                        {detailedApplication.general_manager ? (
                                          <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-start gap-4">
                                              {/* Passport Thumbnail */}
                                              {detailedApplication.general_manager.passport_file_url && (
                                                <div className="flex-shrink-0">
                                                  <div className="relative group">
                                                    <img 
                                                      src={detailedApplication.general_manager.passport_file_url} 
                                                      alt="Passport" 
                                                      className="w-16 h-20 object-cover border border-gray-300 rounded cursor-pointer hover:opacity-80"
                                                      onClick={() => window.open(detailedApplication.general_manager.passport_file_url, '_blank')}
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center transition-all">
                                                      <div className="opacity-0 group-hover:opacity-100 text-white text-xs">
                                                        Click to view
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-1 w-full text-xs"
                                                    onClick={() => {
                                                      const link = document.createElement('a')
                                                      link.href = detailedApplication.general_manager.passport_file_url
                                                      link.download = `passport_${detailedApplication.general_manager.first_name}_${detailedApplication.general_manager.last_name}.jpg`
                                                      link.click()
                                                    }}
                                                  >
                                                    Download
                                                  </Button>
                                                </div>
                                              )}
                                              
                                              {/* Details */}
                                              <div className="flex-1">
                                                <div className="grid grid-cols-3 gap-3">
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Full Name</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.first_name} {detailedApplication.general_manager.middle_name || ''} {detailedApplication.general_manager.last_name}</p>
                                                  </div>
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Email</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.email || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Gender</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.gender || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.date_of_birth || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Nationality</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.nationality || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Passport Number</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.passport_number || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Passport Issue Date</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.passport_issue_date || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <label className="text-xs font-medium text-gray-500">Passport Expiry Date</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.passport_expiry_date || 'N/A'}</p>
                                                  </div>
                                          <div>
                                                    <label className="text-xs font-medium text-gray-500">Issue Country</label>
                                                    <p className="text-sm text-gray-900">{detailedApplication.general_manager.passport_issue_country || 'N/A'}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-2 gap-4">
                                            {detailedApplication.gm_signatory_name && (
                                              <div>
                                                <label className="text-sm font-medium text-gray-700">Signatory Name</label>
                                                <p className="text-sm text-gray-900">{detailedApplication.gm_signatory_name}</p>
                                              </div>
                                            )}
                                            {detailedApplication.gm_signatory_email && (
                                          <div>
                                                <label className="text-sm font-medium text-gray-700">Signatory Email</label>
                                                <p className="text-sm text-gray-900">{detailedApplication.gm_signatory_email}</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Files & Documents */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Files & Documents</h3>
                                      {detailedApplication.all_documents && detailedApplication.all_documents.length > 0 ? (
                                        <div className="space-y-4">
                                          {/* Passport Files */}
                                          {detailedApplication.all_documents.filter(doc => doc.document_type === 'passport').length > 0 && (
                                            <div>
                                              <h4 className="text-md font-medium mb-2 text-gray-800">Passport Files</h4>
                                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {detailedApplication.all_documents
                                                  .filter(doc => doc.document_type === 'passport')
                                                  .map((doc, index) => (
                                                    <div key={index} className="relative group">
                                                      {doc.is_image && doc.display_url ? (
                                                        <div className="relative">
                                                          <img 
                                                            src={doc.display_url} 
                                                            alt={`Passport - ${doc.file_name}`}
                                                            className="w-full h-32 object-cover border border-gray-300 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => window.open(doc.display_url, '_blank')}
                                                          />
                                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all">
                                                            <div className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium">
                                                              Click to view
                                                            </div>
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        <div className="w-full h-32 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                                                          <FileText className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                      )}
                                                      <div className="mt-2 space-y-1">
                                                        <p className="text-xs font-medium text-gray-900 truncate">{doc.file_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                          {doc.document_type} • {Math.round(doc.file_size / 1024)}KB
                                                        </p>
                                                        <div className="flex gap-1">
                                                          {doc.display_url && (
                                                            <Button 
                                                              variant="outline" 
                                                              size="sm" 
                                                              className="text-xs h-6 px-2"
                                                              onClick={() => window.open(doc.display_url, '_blank')}
                                                            >
                                                              View
                                                            </Button>
                                                          )}
                                                          {doc.download_url && (
                                                            <Button 
                                                              variant="outline" 
                                                              size="sm" 
                                                              className="text-xs h-6 px-2"
                                                              onClick={() => {
                                                                const link = document.createElement('a')
                                                                link.href = doc.download_url
                                                                link.download = doc.file_name
                                                                link.click()
                                                              }}
                                                            >
                                                              Download
                                                            </Button>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Other Documents */}
                                          {detailedApplication.all_documents.filter(doc => doc.document_type !== 'passport').length > 0 && (
                                            <div>
                                              <h4 className="text-md font-medium mb-2 text-gray-800">Other Documents</h4>
                                              <div className="space-y-2">
                                                {detailedApplication.all_documents
                                                  .filter(doc => doc.document_type !== 'passport')
                                                  .map((doc, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                      <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                          <p className="text-xs text-gray-600">
                                                            {doc.document_type} • {Math.round(doc.file_size / 1024)}KB • 
                                                            {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Unknown date'}
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <div className="flex gap-2">
                                                        {doc.display_url && (
                                                          <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => window.open(doc.display_url, '_blank')}
                                                          >
                                                            <Eye className="h-4 w-4" />
                                                          </Button>
                                                        )}
                                                        {doc.download_url && (
                                                          <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => {
                                                              const link = document.createElement('a')
                                                              link.href = doc.download_url
                                                              link.download = doc.file_name
                                                              link.click()
                                                            }}
                                                          >
                                                            Download
                                                          </Button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                          <p className="text-gray-500">No files uploaded yet</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleStatusUpdate(selectedApplication.id, 'under_review')}
                                        disabled={selectedApplication.status === 'under_review'}
                                      >
                                        Mark Under Review
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                                        disabled={selectedApplication.status === 'approved'}
                                      >
                                        Approve
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                                        disabled={selectedApplication.status === 'rejected'}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                ) : selectedApplication && (
                                  <div className="text-center py-8">
                                    <p className="text-gray-500">Failed to load application details</p>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

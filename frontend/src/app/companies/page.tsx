'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/dashboard/sidebar'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Edit2, 
  Save, 
  X,
  Download,
  Eye,
  Clock,
  Loader2,
  Users
} from 'lucide-react'

// Updated interfaces to match API response
interface CompanyData {
  id: string
  name: string
  trade_name?: string
  free_zone: string
  status: string
  license_number?: string
  license_status?: string
  formation_progress: number
  
  // License and renewal information
  license_type?: string
  license_expiry_date?: string
  license_renewal_days?: number
  establishment_card_number?: string
  establishment_card_expiry_date?: string
  
  // Contact information
  official_email?: string
  phone?: string
  website?: string
  
  // People
  shareholders: PersonData[]
  directors: PersonData[]
  
  // Documents
  documents: DocumentsData
  
  // Timestamps
  created_at: string
  updated_at: string
}

interface PersonData {
  id: string
  full_name: string
  identification_type?: string
  identification_number?: string
  passport_number?: string
  passport_expiry_date?: string
  share_percentage?: number
  type: string
}

interface DocumentsData {
  trade_license?: DocumentData
  moa?: DocumentData
  certificate_of_incorporation?: DocumentData
  commercial_license?: DocumentData
}

interface DocumentData {
  id: string
  name: string
  file_name: string
  uploaded_at?: string
  verified: boolean
  download_url: string
}

interface DashboardApiResponse {
  success: boolean
  data: {
    companies: CompanyData[]
    notifications: any[]
    stats: {
      total_companies: number
      in_progress: number
      completed: number
      documents_pending: number
    }
  }
}

function CompaniesPageContent() {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noCompany, setNoCompany] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    company_website: '',
    operating_name_arabic: '',
    company_phone: ''
  })
  
  const searchParams = useSearchParams()
  const userRole = searchParams.get('user') || 'owner'

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const fetchCompanyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch dashboard data which includes user's companies
      const response = await fetch('http://localhost:3001/api/v1/dashboard', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch company data')
      }

      const data: DashboardApiResponse = await response.json()
      
      if (!data.success) {
        throw new Error('Failed to load company data')
      }

      // For now, we'll take the first company from the user's companies
      // In the future, this could be enhanced to handle multiple companies
      const userCompany = data.data.companies[0]
      
      if (!userCompany) {
        // User has no companies yet - this is okay, show appropriate message
        setNoCompany(true)
        return
      }
      
      setCompany(userCompany)
      setEditForm({
        company_website: userCompany.website || '',
        operating_name_arabic: '', // This field may need to be added to the API
        company_phone: userCompany.phone || ''
      })
    } catch (err: any) {
      console.error('Error fetching company data:', err)
      setError(err.message || 'Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async () => {
    try {
      // In production, this would be the actual API call
      // const response = await fetch(`/api/v1/companies/${company.id}/owner_details`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(editForm)
      // })
      
      // Mock update for development
      if (company) {
        setCompany({
          ...company,
          website: editForm.company_website,
          phone: editForm.company_phone
        })
      }
      
      setEditing(false)
    } catch (err) {
      setError('Failed to update company details')
    }
  }

  const handleCancel = () => {
    if (company) {
      setEditForm({
        company_website: company.website || '',
        operating_name_arabic: '', // This field may need to be added to the API
        company_phone: company.phone || ''
      })
    }
    setEditing(false)
  }

  const getTrnBadgeColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'formed': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-orange-100 text-orange-800'
      case 'under_review': return 'bg-orange-100 text-orange-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to determine if company is in "under review" state
  const isUnderReview = (status: string) => {
    return ['submitted', 'under_review', 'processing'].includes(status)
  }

  // Helper function to determine if company is approved
  const isApproved = (status: string) => {
    return ['approved', 'issued', 'formed', 'active'].includes(status)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 flex-shrink-0">
          <Sidebar className="h-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 flex-shrink-0">
          <Sidebar className="h-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={fetchCompanyData} 
              className="mt-4 bg-gradient-to-r from-orange-500 to-gray-400"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (noCompany) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 flex-shrink-0">
          <Sidebar className="h-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Companies Yet</h2>
            <p className="text-gray-600 mb-6">You don't have any companies registered yet.</p>
            <Link href="/application/new">
              <Button className="bg-gradient-to-r from-orange-500 to-gray-400">
                Start Company Formation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 flex-shrink-0">
          <Sidebar className="h-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading company data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render Under Review State
  const renderUnderReviewState = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Under Review</h1>
        <p className="text-gray-600">Your company formation application is being processed</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
          <CardTitle className="text-xl">{company.name}</CardTitle>
          <CardDescription>
            <Badge className={getStatusBadgeColor(company.status)}>
              {company.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Free Zone</Label>
                <p className="text-lg font-semibold">{company.free_zone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Application Progress</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${company.formation_progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{company.formation_progress}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Submitted</Label>
                <p className="mt-1">{new Date(company.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Expected Timeline</Label>
                <p className="mt-1 text-blue-600 font-medium">5-7 business days</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">What happens next?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Our team is reviewing your application and supporting documents. 
                  You will receive an email notification once the review is complete. 
                  If additional information is required, we&apos;ll contact you directly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            If you have questions about your application status, our support team is here to help.
          </p>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Render Approved State (existing detailed view)
  const renderApprovedState = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Company</h1>
          <p className="text-gray-600">Manage your company information and documents</p>
        </div>
        <div className="flex gap-3">
          {!editing && isApproved(company.status) ? (
            <Button onClick={handleEdit} variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Details
            </Button>
          ) : editing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-orange-500 to-gray-400">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Company Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Company Name</Label>
              <p className="text-lg font-semibold">{company.name}</p>
            </div>
            
            {company.trade_name && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Trade Name</Label>
                <p className="text-lg font-semibold">{company.trade_name}</p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Company Website</Label>
              {editing ? (
                <Input
                  value={editForm.company_website}
                  onChange={(e) => setEditForm({...editForm, company_website: e.target.value})}
                  placeholder="https://yourcompany.com"
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4 text-gray-500" />
                  {company.website ? (
                    <Link 
                      href={company.website} 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </Link>
                  ) : (
                    <span className="text-gray-500 italic">Not provided</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Free Zone</Label>
              <p className="mt-1 font-medium">{company.free_zone}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="mt-1">
                <Badge className={getStatusBadgeColor(company.status)}>
                  {company.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Company Official Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{company.official_email || 'Not provided'}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Company Phone</Label>
              {editing ? (
                <Input
                  value={editForm.company_phone}
                  onChange={(e) => setEditForm({...editForm, company_phone: e.target.value})}
                  placeholder="+971 50 123 4567"
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {company.phone || <span className="text-gray-500 italic">Not provided</span>}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Formation Progress</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${company.formation_progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{company.formation_progress}%</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Created</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(company.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shareholders and Directors */}
      {(company.shareholders.length > 0 || company.directors.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shareholders */}
          {company.shareholders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Shareholders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.shareholders.map((shareholder, index) => (
                    <div key={shareholder.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{shareholder.full_name}</p>
                        {shareholder.passport_number && (
                          <p className="text-sm text-gray-600">Passport: {shareholder.passport_number}</p>
                        )}
                      </div>
                      {shareholder.share_percentage && (
                        <Badge variant="outline">
                          {shareholder.share_percentage}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Directors */}
          {company.directors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Directors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.directors.map((director, index) => (
                    <div key={director.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{director.full_name}</p>
                        {director.passport_number && (
                          <p className="text-sm text-gray-600">Passport: {director.passport_number}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {director.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* License Information */}
      {(company.license_number || company.license_type) && (
        <Card>
          <CardHeader>
            <CardTitle>License Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">License Number</Label>
                <p className="font-mono font-semibold">{company.license_number || 'Pending'}</p>
              </div>

              {company.license_type && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">License Type</Label>
                  <p>{company.license_type}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">License Status</Label>
                <Badge className={getStatusBadgeColor(company.license_status || company.status)}>
                  {(company.license_status || company.status).replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {company.establishment_card_number && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Establishment Card Number</Label>
                  <p className="font-mono font-semibold">{company.establishment_card_number}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {company.license_expiry_date && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">License Expiry Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(company.license_expiry_date).toLocaleDateString()}</span>
                  </div>
                  {company.license_renewal_days && (
                    <p className="text-sm text-gray-600 mt-1">
                      {company.license_renewal_days > 0 
                        ? `${company.license_renewal_days} days until renewal`
                        : 'Renewal overdue'
                      }
                    </p>
                  )}
                </div>
              )}

              {company.establishment_card_expiry_date && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Establishment Card Expiry Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(company.establishment_card_expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {Object.keys(company.documents).some(key => company.documents[key as keyof DocumentsData]) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Company Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Certificate of Incorporation */}
              {company.documents.certificate_of_incorporation && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Certificate of Incorporation</h4>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{company.documents.certificate_of_incorporation.file_name}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <Link href={company.documents.certificate_of_incorporation.download_url}>
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <Link href={company.documents.certificate_of_incorporation.download_url} download>
                          <Download className="h-3 w-3" />
                          Download
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Commercial License / Trade License */}
              {(company.documents.trade_license || company.documents.commercial_license) && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Commercial License</h4>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {(company.documents.trade_license || company.documents.commercial_license)?.file_name}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <Link href={(company.documents.trade_license || company.documents.commercial_license)?.download_url || '#'}>
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <Link href={(company.documents.trade_license || company.documents.commercial_license)?.download_url || '#'} download>
                          <Download className="h-3 w-3" />
                          Download
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* MOA */}
              {company.documents.moa && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Memorandum of Association</h4>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{company.documents.moa.file_name}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <Link href={company.documents.moa.download_url}>
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <Link href={company.documents.moa.download_url} download>
                          <Download className="h-3 w-3" />
                          Download
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-full" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {company && isUnderReview(company.status) ? renderUnderReviewState() : 
           company && isApproved(company.status) ? renderApprovedState() :
           <div className="flex items-center justify-center min-h-[400px]">
             <div className="text-center">
               <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">Application Status Unknown</h3>
               <p className="text-gray-600">Your application status could not be determined. Please contact support.</p>
             </div>
           </div>
          }
        </main>
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  return (
    <AuthGuard>
      <CompaniesPageContent />
    </AuthGuard>
  )
}
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
  Eye
} from 'lucide-react'

interface CompanyData {
  id: string
  name: string
  trade_name?: string
  free_zone: string
  status: string
  license_number?: string
  formation_progress: number
  created_at: string
  owner: {
    id: string
    name: string
    email: string
  }
  company_website?: string
  operating_name_arabic?: string
  legal_framework: string
  company_phone?: string
  visa_eligibility: number
  trn_number?: string
  trn_status?: string
  trn_days_remaining: number
  trn_deadline_status: 'normal' | 'warning' | 'overdue'
  license_type: string
  license_issue_date?: string
  license_expiry_date?: string
  first_license_issue_date?: string
  establishment_card_number?: string
  establishment_card_issue_date?: string
  establishment_card_expiry_date?: string
  documents: {
    trade_license?: DocumentData
    certificate_of_incorporation?: DocumentData
    register_of_directors?: DocumentData
  }
}

interface DocumentData {
  id: string
  name: string
  file_name: string
  download_url: string
  is_pdf: boolean
  is_image: boolean
  created_at: string
}

function CompaniesPageContent() {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      // In production, this would be the actual API call
      // const response = await fetch('/api/v1/companies', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // })
      // const data = await response.json()
      
      // Mock data for development
      const mockCompany: CompanyData = {
      id: '1',
      name: 'Sample Tech Solutions LLC',
        trade_name: 'Sample Tech',
      free_zone: 'IFZA',
        status: 'issued',
        license_number: 'IFZA-2024-001234',
        formation_progress: 100,
        created_at: '2024-01-15T10:00:00Z',
        owner: {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@sampletech.com'
        },
        company_website: 'https://sampletech.com',
        operating_name_arabic: 'شركة سامبل تك للحلول التقنية ذ.م.م',
        legal_framework: 'IFZA Free Zone',
        company_phone: '+971 50 123 4567',
        visa_eligibility: 5,
        trn_number: '100123456700003',
        trn_status: 'active',
        trn_days_remaining: 45,
        trn_deadline_status: 'warning',
        license_type: 'IFZA Freezone License',
        license_issue_date: '2024-02-01',
        license_expiry_date: '2025-02-01',
        first_license_issue_date: '2024-02-01',
        establishment_card_number: 'EST-2024-001234',
        establishment_card_issue_date: '2024-02-01',
        establishment_card_expiry_date: '2025-02-01',
        documents: {
          trade_license: {
            id: '1',
            name: 'Trade License',
            file_name: 'trade_license_001234.pdf',
            download_url: '/api/v1/documents/1/download',
            is_pdf: true,
            is_image: false,
            created_at: '2024-02-01T10:00:00Z'
          },
          certificate_of_incorporation: {
            id: '2',
            name: 'Certificate of Incorporation',
            file_name: 'certificate_incorporation_001234.pdf',
            download_url: '/api/v1/documents/2/download',
            is_pdf: true,
            is_image: false,
            created_at: '2024-02-01T10:00:00Z'
          },
          register_of_directors: {
            id: '3',
            name: 'Register of Directors',
            file_name: 'register_directors_001234.pdf',
            download_url: '/api/v1/documents/3/download',
            is_pdf: true,
            is_image: false,
            created_at: '2024-02-01T10:00:00Z'
          }
        }
      }
      
      setCompany(mockCompany)
      setEditForm({
        company_website: mockCompany.company_website || '',
        operating_name_arabic: mockCompany.operating_name_arabic || '',
        company_phone: mockCompany.company_phone || ''
      })
    } catch (err) {
      setError('Failed to load company data')
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
          company_website: editForm.company_website,
          operating_name_arabic: editForm.operating_name_arabic,
          company_phone: editForm.company_phone
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
        company_website: company.company_website || '',
        operating_name_arabic: company.operating_name_arabic || '',
        company_phone: company.company_phone || ''
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
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  if (error || !company) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 flex-shrink-0">
          <Sidebar className="h-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error || 'No company data available'}</p>
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar className="h-full" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
        <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Company</h1>
                <p className="text-gray-600">Manage your company information and documents</p>
        </div>
              <div className="flex gap-3">
                {!editing ? (
                  <Button onClick={handleEdit} variant="outline" className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Details
                  </Button>
                ) : (
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
                )}
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
                        {company.company_website ? (
                          <Link 
                            href={company.company_website} 
                            target="_blank" 
                            className="text-blue-600 hover:underline"
                          >
                            {company.company_website}
                          </Link>
                        ) : (
                          <span className="text-gray-500 italic">Not provided</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Operating Name (Arabic)</Label>
                    {editing ? (
                      <Input
                        value={editForm.operating_name_arabic}
                        onChange={(e) => setEditForm({...editForm, operating_name_arabic: e.target.value})}
                        placeholder="اسم الشركة بالعربية"
                        className="mt-1"
                        dir="rtl"
                      />
                    ) : (
                      <p className="mt-1" dir="rtl">
                        {company.operating_name_arabic || <span className="text-gray-500 italic" dir="ltr">Not provided</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Legal Framework</Label>
                    <p className="mt-1 font-medium">{company.legal_framework}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Company Official Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{company.owner.email}</span>
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
                        {company.company_phone || <span className="text-gray-500 italic">Not provided</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Employee Visa Eligibility</Label>
                    <p className="mt-1 text-lg font-semibold text-blue-600">{company.visa_eligibility} visas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Registration */}
            <Card>
          <CardHeader>
                <CardTitle>Tax Registration (TRN)</CardTitle>
          </CardHeader>
          <CardContent>
                {company.trn_number ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tax Registration Number</Label>
                      <p className="text-lg font-mono font-semibold">{company.trn_number}</p>
                      <Badge className={`mt-2 ${getStatusBadgeColor(company.trn_status || '')}`}>
                        {company.trn_status?.toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-2">Tax registration is required within 90 days of company formation.</p>
                      <Badge className={`${getTrnBadgeColor(company.trn_deadline_status)} flex items-center gap-1 w-fit`}>
                        {company.trn_deadline_status === 'overdue' && <AlertTriangle className="h-3 w-3" />}
                        {company.trn_deadline_status === 'overdue' 
                          ? 'OVERDUE' 
                          : `${company.trn_days_remaining} days remaining`
                        }
                      </Badge>
                    </div>
                    <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                      Register for Corporation Tax
            </Button>
                  </div>
                )}
          </CardContent>
        </Card>

            {/* License Information */}
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

                  <div>
                    <Label className="text-sm font-medium text-gray-700">License Type</Label>
                    <p>{company.license_type}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">License Status</Label>
                    <Badge className={getStatusBadgeColor(company.status)}>
                      {company.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">First License Issue Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{company.first_license_issue_date ? new Date(company.first_license_issue_date).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Current License Issue Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{company.license_issue_date ? new Date(company.license_issue_date).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">License Expiry Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{company.license_expiry_date ? new Date(company.license_expiry_date).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Establishment Card Number</Label>
                    <p className="font-mono font-semibold">{company.establishment_card_number || 'Pending'}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Establishment Card Issue Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{company.establishment_card_issue_date ? new Date(company.establishment_card_issue_date).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Establishment Card Expiry Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{company.establishment_card_expiry_date ? new Date(company.establishment_card_expiry_date).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
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
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Certificate of Incorporation</h4>
                      {company.documents.certificate_of_incorporation && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {company.documents.certificate_of_incorporation ? (
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
                    ) : (
                      <p className="text-sm text-gray-500">Document not yet available</p>
                    )}
                  </div>

                  {/* Commercial License */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Commercial License</h4>
                      {company.documents.trade_license && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {company.documents.trade_license ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{company.documents.trade_license.file_name}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1" asChild>
                            <Link href={company.documents.trade_license.download_url}>
                              <Eye className="h-3 w-3" />
                              View
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1" asChild>
                            <Link href={company.documents.trade_license.download_url} download>
                              <Download className="h-3 w-3" />
                              Download
                            </Link>
                    </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Document not yet available</p>
                    )}
                  </div>

                  {/* Register of Directors */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Register of Directors</h4>
                      {company.documents.register_of_directors && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {company.documents.register_of_directors ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{company.documents.register_of_directors.file_name}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1" asChild>
                            <Link href={company.documents.register_of_directors.download_url}>
                              <Eye className="h-3 w-3" />
                              View
                            </Link>
                    </Button>
                          <Button size="sm" variant="outline" className="gap-1" asChild>
                            <Link href={company.documents.register_of_directors.download_url} download>
                              <Download className="h-3 w-3" />
                              Download
                            </Link>
                    </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Document not yet available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
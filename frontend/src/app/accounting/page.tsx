'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, FileText, Calendar, DollarSign, AlertCircle, CheckCircle, Loader2, Plus } from 'lucide-react'
import { apiGet } from '@/lib/api'
import TaxCalendar from '@/components/accounting/TaxCalendar'

interface TaxRegistration {
  id: string
  registration_type: string
  status: string
  trn_number?: string
  registration_date?: string
  effective_date?: string
  next_filing_date?: string
  annual_turnover?: number
  tax_period?: string
  applied_at?: string
  approved_at?: string
  rejected_at?: string
  is_overdue: boolean
  days_until_filing?: number
  can_apply: boolean
  can_file_return: boolean
  registration_required: boolean
  created_at: string
  company: {
    id: string
    name: string
  }
}

interface TaxRegistrationsData {
  data: TaxRegistration[]
  stats: {
    total: number
    active: number
    pending: number
    overdue_filings: number
  }
}

export default function AccountingPage() {
  const [taxData, setTaxData] = useState<TaxRegistrationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTaxRegistrations()
  }, [])

  const fetchTaxRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiGet('/tax_registrations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tax registrations')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setTaxData({
          data: result.data || [],
          stats: result.stats || { total: 0, active: 0, pending: 0, overdue_filings: 0 }
        })
      } else {
        throw new Error(result.error || 'Failed to fetch tax registrations')
      }
    } catch (err) {
      console.error('Error fetching tax registrations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tax registrations')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_registered': return 'bg-gray-100 text-gray-800'
      case 'pending_application': return 'bg-orange-100 text-orange-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'not_registered': return 'Not Registered'
      case 'pending_application': return 'Pending Application'
      case 'under_review': return 'Under Review'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      case 'active': return 'Active'
      case 'suspended': return 'Suspended'
      case 'cancelled': return 'Cancelled'
      default: return status.replace('_', ' ').toUpperCase()
    }
  }

  const getRegistrationTypeDisplayName = (type: string) => {
    switch (type) {
      case 'corporate_tax': return 'Corporate Tax'
      case 'vat': return 'VAT'
      case 'excise': return 'Excise Tax'
      default: return type.replace('_', ' ').toUpperCase()
    }
  }

  return (
    <DashboardLayout 
      title="Accounting & Tax" 
      description="Manage tax registrations, filings, and compliance"
    >
      <div className="space-y-6">
        {/* Tax Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Registrations</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {taxData?.stats.active || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {taxData?.stats.pending || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Turnover</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">500K</div>
              <p className="text-xs text-muted-foreground">AED</p>
            </CardContent>
          </Card>
        </div>

        {/* Tax Registrations */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tax Registrations</CardTitle>
                <CardDescription>
                  Manage your Corporate Tax, VAT, and Excise registrations
                </CardDescription>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                Apply for Registration
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading tax registrations...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchTaxRegistrations} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : !taxData?.data || taxData.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calculator className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-4">No tax registrations found</p>
                <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                  Apply for Your First Registration
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {taxData.data.map((registration) => (
                  <div key={registration.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          {getRegistrationTypeDisplayName(registration.registration_type)}
                        </h4>
                        {registration.trn_number && (
                          <p className="text-sm text-gray-600">TRN: {registration.trn_number}</p>
                        )}
                        {registration.registration_required && (
                          <p className="text-xs text-blue-600 mt-1">✓ Required for your business</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStatusColor(registration.status)}>
                          {getStatusDisplayName(registration.status)}
                        </Badge>
                        {registration.is_overdue && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Registration Date:</span>
                        <p className="text-gray-600">
                          {registration.registration_date ? 
                            new Date(registration.registration_date).toLocaleDateString() : 
                            'Not registered'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Next Filing:</span>
                        <p className={`${registration.is_overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {registration.next_filing_date ? 
                            new Date(registration.next_filing_date).toLocaleDateString() : 
                            'N/A'
                          }
                          {registration.days_until_filing !== undefined && registration.days_until_filing > 0 && (
                            <span className="text-blue-600 ml-2">
                              ({registration.days_until_filing} days)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Annual Turnover:</span>
                        <p className="text-gray-600">
                          {registration.annual_turnover ? 
                            `${registration.annual_turnover.toLocaleString()} AED` : 
                            'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">View Details</Button>
                      {registration.can_apply && (
                        <Button variant="outline" size="sm" className="text-blue-600">
                          Apply Now
                        </Button>
                      )}
                      {registration.can_file_return && (
                        <Button variant="outline" size="sm" className="text-green-600">
                          File Return
                        </Button>
                      )}
                      {registration.status === 'pending_application' && (
                        <Button variant="outline" size="sm">Check Status</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Registration Guide</CardTitle>
              <CardDescription>
                Understanding UAE tax requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Corporate Tax</p>
                  <p className="text-sm text-blue-700">
                    Mandatory for all UAE companies. 9% on profits above 375K AED.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">VAT Registration</p>
                  <p className="text-sm text-orange-700">
                    Required if annual turnover exceeds 375,000 AED. 5% standard rate.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Excise Tax</p>
                  <p className="text-sm text-purple-700">
                    For tobacco, carbonated drinks, and energy drinks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TaxCalendar monthsAhead={6} />
        </div>
      </div>
    </DashboardLayout>
  )
}

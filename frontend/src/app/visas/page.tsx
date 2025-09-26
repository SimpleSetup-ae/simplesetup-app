'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plane, Clock, CheckCircle, AlertTriangle, Loader2, Plus } from 'lucide-react'
import { apiGet } from '@/lib/api'

interface VisaApplication {
  id: string
  visa_type: string
  status: string
  current_stage: number
  total_stages: number
  stage_name: string
  progress_percentage: number
  application_number?: string
  visa_number?: string
  visa_fee?: number
  fee_currency: string
  submitted_at?: string
  completed_at?: string
  estimated_completion_date?: string
  days_until_completion?: number
  is_overdue: boolean
  company: {
    id: string
    name: string
    free_zone: string
  }
  person: {
    id: string
    full_name: string
    nationality: string
  }
}

export default function VisasPage() {
  const [visas, setVisas] = useState<VisaApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVisaApplications()
  }, [])

  const fetchVisaApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiGet('/visa_applications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch visa applications')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setVisas(data.data || [])
      } else {
        throw new Error(data.error || 'Failed to fetch visa applications')
      }
    } catch (err) {
      console.error('Error fetching visa applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch visa applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entry_permit': return 'bg-blue-100 text-blue-800'
      case 'medical': return 'bg-orange-100 text-orange-800'
      case 'eid_biometrics': return 'bg-purple-100 text-purple-800'
      case 'stamping': return 'bg-yellow-100 text-yellow-800'
      case 'issuance': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'entry_permit': return 'Entry Permit'
      case 'medical': return 'Medical Examination'
      case 'eid_biometrics': return 'EID Biometrics'
      case 'stamping': return 'Passport Stamping'
      case 'issuance': return 'Visa Issuance'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'rejected': return 'Rejected'
      default: return status.replace('_', ' ').toUpperCase()
    }
  }

  const getVisaTypeDisplayName = (type: string) => {
    switch (type) {
      case 'investor': return 'Investor Visa'
      case 'employee': return 'Employee Visa'
      case 'family': return 'Family Visa'
      case 'visit': return 'Visit Visa'
      case 'partner': return 'Partner Visa'
      default: return type.replace('_', ' ').toUpperCase()
    }
  }

  return (
    <DashboardLayout 
      title="Visa Management" 
      description="Track and manage visa applications for your company employees"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {visas.filter(v => v.status !== 'completed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {visas.filter(v => v.status === 'completed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attention Needed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {visas.filter(v => v.is_overdue || v.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visa Applications */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Visa Applications</CardTitle>
                <CardDescription>
                  Track the progress of all visa applications
                </CardDescription>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                New Application
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading visa applications...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchVisaApplications} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : visas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Plane className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-4">No visa applications found</p>
                <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                  Create Your First Application
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {visas.map((visa) => (
                  <div key={visa.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{visa.person.full_name}</h4>
                        <p className="text-sm text-gray-600">{visa.company.name} • {getVisaTypeDisplayName(visa.visa_type)}</p>
                        {visa.application_number && (
                          <p className="text-xs text-gray-400">App #: {visa.application_number}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStatusColor(visa.status)}>
                          {getStatusDisplayName(visa.status)}
                        </Badge>
                        {visa.is_overdue && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{visa.stage_name}</span>
                        <span>{visa.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            visa.is_overdue ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-gray-400'
                          }`}
                          style={{ width: `${visa.progress_percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Stage {visa.current_stage} of {visa.total_stages}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div>
                        {visa.submitted_at && (
                          <span>Submitted: {new Date(visa.submitted_at).toLocaleDateString()}</span>
                        )}
                        {visa.estimated_completion_date && (
                          <span className="ml-4">
                            Est. Completion: {new Date(visa.estimated_completion_date).toLocaleDateString()}
                          </span>
                        )}
                        {visa.days_until_completion !== undefined && visa.days_until_completion > 0 && (
                          <span className="ml-4 text-blue-600">
                            {visa.days_until_completion} days remaining
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        {visa.status !== 'completed' && visa.status !== 'cancelled' && visa.status !== 'rejected' && (
                          <Button variant="outline" size="sm">Update Stage</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

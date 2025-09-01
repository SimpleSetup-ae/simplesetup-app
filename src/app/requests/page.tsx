import Sidebar from '@/components/dashboard/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, Users, Building2 } from 'lucide-react'

export default function RequestsPage() {
  // Mock requests data
  const requests = [
    {
      id: '1',
      request_type: 'name_change',
      title: 'Change Company Name',
      description: 'Update company name from Sample Tech to Advanced Tech Solutions',
      status: 'under_review',
      fee_amount: 1500,
      fee_currency: 'AED',
      submitted_at: '2024-01-10T10:00:00Z',
      company: 'Sample Tech Solutions LLC',
      processing_time_days: 7
    },
    {
      id: '2',
      request_type: 'shareholder_change',
      title: 'Add New Shareholder',
      description: 'Add Jane Smith as 25% shareholder',
      status: 'approved',
      fee_amount: 2000,
      fee_currency: 'AED',
      submitted_at: '2024-01-05T10:00:00Z',
      processed_at: '2024-01-08T14:30:00Z',
      company: 'Digital Marketing Co.',
      processing_time_days: 3
    },
    {
      id: '3',
      request_type: 'noc_letter',
      title: 'NOC for Bank Account Opening',
      description: 'No Objection Certificate for opening corporate bank account',
      status: 'completed',
      fee_amount: 500,
      fee_currency: 'AED',
      submitted_at: '2024-01-01T10:00:00Z',
      completed_at: '2024-01-02T16:00:00Z',
      company: 'Sample Tech Solutions LLC',
      processing_time_days: 1
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'name_change': return <FileText className="h-4 w-4" />
      case 'shareholder_change': return <Users className="h-4 w-4" />
      case 'activity_change': return <Building2 className="h-4 w-4" />
      case 'noc_letter': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'name_change': 'Name Change',
      'shareholder_change': 'Shareholder Change',
      'activity_change': 'Activity Change',
      'noc_letter': 'NOC Letter'
    }
    return labels[type] || type
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
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Management</h1>
              <p className="text-gray-600">Submit and track amendment requests for your companies</p>
            </div>
            
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{requests.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {requests.filter(r => r.status === 'under_review').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {requests.filter(r => ['approved', 'completed'].includes(r.status)).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {requests.filter(r => r.status === 'rejected').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Requests List */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Amendment Requests</CardTitle>
                      <CardDescription>
                        Track all requests for company changes and amendments
                      </CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500 gap-2">
                      <Plus className="h-4 w-4" />
                      New Request
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getRequestTypeIcon(request.request_type)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{request.title}</h4>
                              <p className="text-sm text-gray-600 mb-1">{request.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{getRequestTypeLabel(request.request_type)}</span>
                                <span>•</span>
                                <span>{request.company}</span>
                                <span>•</span>
                                <span>{request.fee_amount} {request.fee_currency}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-600">
                            <span>Submitted: {new Date(request.submitted_at).toLocaleDateString()}</span>
                            {request.processed_at && (
                              <span className="ml-4">
                                Processed: {new Date(request.processed_at).toLocaleDateString()}
                              </span>
                            )}
                            {request.completed_at && (
                              <span className="ml-4">
                                Completed: {new Date(request.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View Details</Button>
                            {request.status === 'pending' && (
                              <Button variant="outline" size="sm">Edit</Button>
                            )}
                            {request.status === 'completed' && request.request_type === 'noc_letter' && (
                              <Button variant="outline" size="sm">Download NOC</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Available Request Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Request Types</CardTitle>
                  <CardDescription>
                    Common amendment requests you can submit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        type: 'name_change',
                        title: 'Company Name Change',
                        description: 'Update your company or trade name',
                        fee: '1,500 AED',
                        processing_time: '7 days'
                      },
                      {
                        type: 'shareholder_change',
                        title: 'Shareholder Changes',
                        description: 'Add, remove, or transfer shares',
                        fee: '2,000 AED',
                        processing_time: '10 days'
                      },
                      {
                        type: 'activity_change',
                        title: 'Activity Changes',
                        description: 'Modify business activities',
                        fee: '1,000 AED',
                        processing_time: '5 days'
                      },
                      {
                        type: 'noc_letter',
                        title: 'NOC Letter',
                        description: 'No Objection Certificate',
                        fee: '500 AED',
                        processing_time: '3 days'
                      }
                    ].map((requestType) => (
                      <Card key={requestType.type} className="transition-all hover:shadow-md">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            {getRequestTypeIcon(requestType.type)}
                            <CardTitle className="text-base">{requestType.title}</CardTitle>
                          </div>
                          <CardDescription>{requestType.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <p>Fee: <span className="font-medium">{requestType.fee}</span></p>
                              <p>Processing: <span className="font-medium">{requestType.processing_time}</span></p>
                            </div>
                            <Button variant="outline" size="sm">
                              Submit Request
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
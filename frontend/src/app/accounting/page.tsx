import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, FileText, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default function AccountingPage() {
  // Mock tax registration data
  const taxRegistrations = [
    {
      id: '1',
      type: 'Corporate Tax',
      status: 'active',
      trn_number: 'TRN123456789',
      registration_date: '2024-01-01',
      next_filing_date: '2024-09-30',
      annual_turnover: 500000
    },
    {
      id: '2',
      type: 'VAT',
      status: 'pending_application',
      trn_number: null,
      registration_date: null,
      next_filing_date: null,
      annual_turnover: 400000
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending_application': return 'bg-orange-100 text-orange-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
                {taxRegistrations.filter(t => t.status === 'active').length}
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
                {taxRegistrations.filter(t => t.status === 'pending_application').length}
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
            <div className="space-y-4">
              {taxRegistrations.map((registration) => (
                <div key={registration.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        {registration.type}
                      </h4>
                      {registration.trn_number && (
                        <p className="text-sm text-gray-600">TRN: {registration.trn_number}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(registration.status)}>
                      {registration.status.replace('_', ' ').toUpperCase()}
                    </Badge>
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
                      <p className="text-gray-600">
                        {registration.next_filing_date ? 
                          new Date(registration.next_filing_date).toLocaleDateString() : 
                          'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Annual Turnover:</span>
                      <p className="text-gray-600">{registration.annual_turnover.toLocaleString()} AED</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    {registration.status === 'active' && (
                      <Button variant="outline" size="sm">File Return</Button>
                    )}
                    {registration.status === 'pending_application' && (
                      <Button variant="outline" size="sm">Check Status</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Important tax filing and compliance dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Corporate Tax Return</p>
                      <p className="text-sm text-gray-600">Sample Tech Solutions LLC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Sep 30, 2024</p>
                    <p className="text-sm text-orange-600">245 days left</p>
                  </div>
                </div>
                
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No other deadlines in the next 90 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

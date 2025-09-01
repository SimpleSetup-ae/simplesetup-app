import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plane, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function VisasPage() {
  // Mock visa data
  const visas = [
    {
      id: '1',
      applicant_name: 'John Doe',
      company: 'Sample Tech Solutions LLC',
      visa_type: 'Investor Visa',
      status: 'medical_stage',
      stage: 2,
      total_stages: 5,
      submitted_at: '2024-01-10T10:00:00Z',
      estimated_completion: '2024-02-15'
    },
    {
      id: '2',
      applicant_name: 'Jane Smith',
      company: 'Digital Marketing Co.',
      visa_type: 'Employee Visa',
      status: 'stamping',
      stage: 4,
      total_stages: 5,
      submitted_at: '2024-01-05T10:00:00Z',
      estimated_completion: '2024-01-25'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entry_permit': return 'bg-blue-100 text-blue-800'
      case 'medical_stage': return 'bg-orange-100 text-orange-800'
      case 'eid_biometrics': return 'bg-purple-100 text-purple-800'
      case 'stamping': return 'bg-yellow-100 text-yellow-800'
      case 'issuance': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
              <div className="text-2xl font-bold text-red-600">1</div>
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
            <div className="space-y-4">
              {visas.map((visa) => (
                <div key={visa.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{visa.applicant_name}</h4>
                      <p className="text-sm text-gray-600">{visa.company} • {visa.visa_type}</p>
                    </div>
                    <Badge className={getStatusColor(visa.status)}>
                      {visa.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stage {visa.stage} of {visa.total_stages}</span>
                      <span>{Math.round((visa.stage / visa.total_stages) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-gray-400 h-2 rounded-full"
                        style={{ width: `${(visa.stage / visa.total_stages) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Est. completion: {new Date(visa.estimated_completion).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Update Status</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

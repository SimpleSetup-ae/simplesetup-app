import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserPlus, Mail, Shield } from 'lucide-react'

export default function UsersPage() {
  // Mock users data
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@sampletech.com',
      role: 'owner',
      company: 'Sample Tech Solutions LLC',
      status: 'active',
      last_login: '2024-01-15T10:00:00Z',
      avatar: null
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@digitalmarketing.com',
      role: 'admin',
      company: 'Digital Marketing Co.',
      status: 'active',
      last_login: '2024-01-14T16:30:00Z',
      avatar: null
    },
    {
      id: '3',
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@sampletech.com',
      role: 'accountant',
      company: 'Sample Tech Solutions LLC',
      status: 'invited',
      last_login: null,
      avatar: null
    }
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'accountant': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'invited': return 'bg-orange-100 text-orange-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout 
      title="Users & Permissions" 
      description="Manage team members and their access to your companies"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.status === 'invited').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage user access and permissions across your companies
                </CardDescription>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500 gap-2">
                <UserPlus className="h-4 w-4" />
                Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.last_login ? 
                          `Last login: ${new Date(user.last_login).toLocaleDateString()}` :
                          'Never logged in'
                        }
                      </p>
                    </div>
                    
                    <Badge className={getStatusColor(user.status)}>
                      {user.status.toUpperCase()}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      {user.status === 'invited' && (
                        <Button variant="outline" size="sm">Resend Invite</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Understanding access levels for different roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  role: 'Owner',
                  description: 'Full access to all company data and settings',
                  permissions: ['Create/delete companies', 'Manage users', 'Financial access', 'All documents']
                },
                {
                  role: 'Admin', 
                  description: 'Manage company operations and workflows',
                  permissions: ['Manage workflows', 'Upload documents', 'View financials', 'Manage users']
                },
                {
                  role: 'Accountant',
                  description: 'Financial and tax-related access',
                  permissions: ['Tax registrations', 'Financial reports', 'Payment history', 'View documents']
                },
                {
                  role: 'Viewer',
                  description: 'Read-only access to company information',
                  permissions: ['View company info', 'View documents', 'View progress', 'Basic reporting']
                }
              ].map((roleInfo) => (
                <Card key={roleInfo.role}>
                  <CardHeader>
                    <CardTitle className="text-base">{roleInfo.role}</CardTitle>
                    <CardDescription className="text-sm">
                      {roleInfo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {roleInfo.permissions.map((permission, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

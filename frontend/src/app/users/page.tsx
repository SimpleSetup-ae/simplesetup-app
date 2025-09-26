'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserPlus, Mail, Shield, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { apiGet } from '@/lib/api'

interface TeamMember {
  id: string
  role: string
  accepted: boolean
  accepted_at?: string
  created_at: string
  user: {
    id: string
    email: string
    full_name: string
    first_name: string
    last_name: string
    last_sign_in_at?: string
    sign_in_count: number
    confirmed: boolean
    locked: boolean
  }
  company: {
    id: string
    name: string
  }
}

interface TeamMembersData {
  members: TeamMember[]
  pending_invitations: any[]
  stats: {
    total_members: number
    pending_count: number
    active_count: number
  }
}

export default function UsersPage() {
  const [teamData, setTeamData] = useState<TeamMembersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiGet('/company_memberships')
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTeamData(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch team members')
      }
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }

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
              <div className="text-2xl font-bold">
                {teamData?.stats.total_members || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {teamData?.stats.active_count || 0}
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
                {teamData?.stats.pending_count || 0}
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading team members...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchTeamMembers} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : !teamData?.members || teamData.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-4">No team members found</p>
                <Button className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500">
                  Invite Your First Team Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {teamData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.user.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h4 className="font-medium">{member.user.full_name}</h4>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                        <p className="text-xs text-gray-500">{member.company.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          {member.user.confirmed ? (
                            <span className="text-green-600">✓ Confirmed</span>
                          ) : (
                            <span className="text-orange-600">Unconfirmed</span>
                          )}
                          {member.user.locked && (
                            <span className="text-red-600">• Locked</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge className={getRoleColor(member.role)}>
                          {member.role.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {member.user.last_sign_in_at ? 
                            `Last login: ${new Date(member.user.last_sign_in_at).toLocaleDateString()}` :
                            'Never logged in'
                          }
                        </p>
                        <p className="text-xs text-gray-400">
                          {member.user.sign_in_count} logins
                        </p>
                      </div>
                      
                      <Badge className={member.accepted ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                        {member.accepted ? 'ACTIVE' : 'PENDING'}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        {!member.accepted && (
                          <Button variant="outline" size="sm">Resend Invite</Button>
                        )}
                        {member.role !== 'owner' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

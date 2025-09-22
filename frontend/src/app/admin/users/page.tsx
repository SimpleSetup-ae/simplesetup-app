'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Eye, Search, Plus, Edit, Trash2, Shield, Users, Mail, Calendar, UserPlus, UserCheck, UserX } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  isAdmin: boolean
  createdAt: string
  lastSignInAt?: string
  signInCount: number
  confirmed: boolean
  locked: boolean
  companiesCount: number
}

interface UserStats {
  total: number
  admins: number
  active: number
  locked: number
  unconfirmed: number
}

interface NewUserData {
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
  sendInvitation: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<UserStats>({ total: 0, admins: 0, active: 0, locked: 0, unconfirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [newUserData, setNewUserData] = useState<NewUserData>({
    email: '',
    firstName: '',
    lastName: '',
    isAdmin: false,
    sendInvitation: true
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/v1/admin/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
        setStats(data.stats)
      } else {
        throw new Error(data.message || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Set empty state on error
      setUsers([])
      setStats({ total: 0, admins: 0, active: 0, locked: 0, unconfirmed: 0 })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && user.isAdmin) ||
                       (roleFilter === 'user' && !user.isAdmin)
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.confirmed && !user.locked) ||
                         (statusFilter === 'locked' && user.locked) ||
                         (statusFilter === 'unconfirmed' && !user.confirmed)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: newUserData.email,
            first_name: newUserData.firstName,
            last_name: newUserData.lastName,
            is_admin: newUserData.isAdmin
          },
          send_invitation: newUserData.sendInvitation,
          auto_confirm: true
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "User Created",
          description: `User ${newUserData.email} has been created successfully.`,
        })
        
        setShowNewUserDialog(false)
        setNewUserData({
          email: '',
          firstName: '',
          lastName: '',
          isAdmin: false,
          sendInvitation: true
        })
        
        await fetchUsers()
      } else {
        throw new Error(data.errors?.join(', ') || data.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/admin/users/${userId}/toggle_admin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "User Updated",
          description: data.message,
        })
        
        await fetchUsers()
      } else {
        throw new Error(data.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleLockStatus = async (userId: string, locked: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/admin/users/${userId}/toggle_lock`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "User Updated",
          description: data.message,
        })
        
        await fetchUsers()
      } else {
        throw new Error(data.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Users" description="Manage admin users and permissions">
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
    <DashboardLayout title="Users" description="Manage admin users and permissions">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locked Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.locked}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unconfirmed</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unconfirmed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowNewUserDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Companies</TableHead>
                    <TableHead>Sign Ins</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                          {user.isAdmin ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            'User'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.locked && (
                            <Badge variant="destructive" className="text-xs">
                              Locked
                            </Badge>
                          )}
                          {!user.confirmed && (
                            <Badge variant="outline" className="text-xs">
                              Unconfirmed
                            </Badge>
                          )}
                          {user.confirmed && !user.locked && (
                            <Badge variant="secondary" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.companiesCount}</TableCell>
                      <TableCell>{user.signInCount}</TableCell>
                      <TableCell>
                        {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Full Name</label>
                                      <p className="text-sm text-gray-600">{selectedUser.fullName}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Role</label>
                                      <Badge variant={selectedUser.isAdmin ? 'default' : 'secondary'}>
                                        {selectedUser.isAdmin ? 'Admin' : 'User'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <div className="flex gap-1">
                                        {selectedUser.locked && <Badge variant="destructive">Locked</Badge>}
                                        {!selectedUser.confirmed && <Badge variant="outline">Unconfirmed</Badge>}
                                        {selectedUser.confirmed && !selectedUser.locked && <Badge variant="secondary">Active</Badge>}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Companies Owned</label>
                                      <p className="text-sm text-gray-600">{selectedUser.companiesCount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Sign In Count</label>
                                      <p className="text-sm text-gray-600">{selectedUser.signInCount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Last Sign In</label>
                                      <p className="text-sm text-gray-600">
                                        {selectedUser.lastSignInAt ? new Date(selectedUser.lastSignInAt).toLocaleString() : 'Never'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Created</label>
                                      <p className="text-sm text-gray-600">
                                        {new Date(selectedUser.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-4 border-t">
                                    <Button 
                                      size="sm" 
                                      variant={selectedUser.isAdmin ? "destructive" : "default"}
                                      onClick={() => handleToggleAdminStatus(selectedUser.id, selectedUser.isAdmin)}
                                    >
                                      {selectedUser.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleToggleLockStatus(selectedUser.id, selectedUser.locked)}
                                    >
                                      {selectedUser.locked ? 'Unlock User' : 'Lock User'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* New User Dialog */}
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={newUserData.isAdmin}
                  onCheckedChange={(checked) => setNewUserData({...newUserData, isAdmin: checked as boolean})}
                />
                <Label htmlFor="isAdmin">Grant admin privileges</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendInvitation"
                  checked={newUserData.sendInvitation}
                  onCheckedChange={(checked) => setNewUserData({...newUserData, sendInvitation: checked as boolean})}
                />
                <Label htmlFor="sendInvitation">Send invitation email</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

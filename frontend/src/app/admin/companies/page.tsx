'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Eye, Search, Building2, Calendar, ExternalLink, FileText, Users, Shield } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  tradeName?: string
  licenseNumber?: string
  freeZone: string
  status: string
  formedAt?: string
  licenseExpiryDate?: string
  ownerEmail?: string
  ownerFullName?: string
  estimatedAnnualTurnover?: number
  shareholderCount: number
  directorCount: number
  licenseType?: string
  businessCommunity?: string
}

interface CompanyStats {
  total: number
  active: number
  formed: number
  issued: number
  expiringLicenses: number
}

const statusConfig = {
  'formed': { label: 'Formed', color: 'bg-green-100 text-green-800' },
  'active': { label: 'Active', color: 'bg-green-100 text-green-800' },
  'issued': { label: 'Issued', color: 'bg-blue-100 text-blue-800' },
  'suspended': { label: 'Suspended', color: 'bg-red-100 text-red-800' },
  'cancelled': { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<CompanyStats>({ total: 0, active: 0, formed: 0, issued: 0, expiringLicenses: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [freeZoneFilter, setFreeZoneFilter] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/v1/admin/companies', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }

      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.companies)
        setStats(data.stats)
      } else {
        throw new Error(data.message || 'Failed to fetch companies')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      // Set empty state on error
      setCompanies([])
      setStats({ total: 0, active: 0, formed: 0, issued: 0, expiringLicenses: 0 })
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.licenseNumber && company.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (company.ownerEmail && company.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (company.ownerFullName && company.ownerFullName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    const matchesFreeZone = freeZoneFilter === 'all' || company.freeZone === freeZoneFilter
    
    return matchesSearch && matchesStatus && matchesFreeZone
  })

  const isLicenseExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const now = new Date()
    const expiry = new Date(expiryDate)
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    return expiry <= threeMonthsFromNow
  }

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <DashboardLayout title="Companies" description="Manage all formed companies">
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
    <DashboardLayout title="Companies" description="Manage all formed companies">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formed</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.formed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issued</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.issued}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expiringLicenses}</div>
              <p className="text-xs text-muted-foreground">Next 3 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by company name, license number, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="formed">Formed</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={freeZoneFilter} onValueChange={setFreeZoneFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by free zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Free Zones</SelectItem>
                  <SelectItem value="IFZA">IFZA</SelectItem>
                  <SelectItem value="DIFC">DIFC</SelectItem>
                  <SelectItem value="JAFZA">JAFZA</SelectItem>
                  <SelectItem value="ADGM">ADGM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Free Zone</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Formed Date</TableHead>
                    <TableHead>License Expiry</TableHead>
                    <TableHead>Structure</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => {
                    const statusInfo = statusConfig[company.status as keyof typeof statusConfig] || statusConfig.active
                    const isExpiring = isLicenseExpiringSoon(company.licenseExpiryDate)
                    const daysUntilExpiry = getDaysUntilExpiry(company.licenseExpiryDate)
                    
                    return (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{company.name}</div>
                            {company.tradeName && (
                              <div className="text-sm text-gray-500">
                                Trading as: {company.tradeName}
                              </div>
                            )}
                            {company.estimatedAnnualTurnover && (
                              <div className="text-sm text-gray-500">
                                Turnover: AED {company.estimatedAnnualTurnover.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{company.ownerFullName}</div>
                            <div className="text-sm text-gray-500">{company.ownerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{company.freeZone}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-mono text-sm">{company.licenseNumber}</div>
                            {company.licenseType && (
                              <div className="text-sm text-gray-500">{company.licenseType}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {company.formedAt ? new Date(company.formedAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {company.licenseExpiryDate ? (
                            <div className={isExpiring ? 'text-red-600' : ''}>
                              <div>{new Date(company.licenseExpiryDate).toLocaleDateString()}</div>
                              {daysUntilExpiry !== null && (
                                <div className="text-sm">
                                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                                </div>
                              )}
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{company.shareholderCount} Shareholders</div>
                            <div>{company.directorCount} Directors</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCompany(company)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Company Details</DialogTitle>
                                </DialogHeader>
                                {selectedCompany && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Company Name</label>
                                        <p className="text-sm text-gray-600">{selectedCompany.name}</p>
                                      </div>
                                      {selectedCompany.tradeName && (
                                        <div>
                                          <label className="text-sm font-medium">Trade Name</label>
                                          <p className="text-sm text-gray-600">{selectedCompany.tradeName}</p>
                                        </div>
                                      )}
                                      <div>
                                        <label className="text-sm font-medium">License Number</label>
                                        <p className="text-sm text-gray-600 font-mono">{selectedCompany.licenseNumber}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Free Zone</label>
                                        <p className="text-sm text-gray-600">{selectedCompany.freeZone}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Badge className={statusConfig[selectedCompany.status as keyof typeof statusConfig]?.color}>
                                          {statusConfig[selectedCompany.status as keyof typeof statusConfig]?.label}
                                        </Badge>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">License Type</label>
                                        <p className="text-sm text-gray-600">{selectedCompany.licenseType || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Business Community</label>
                                        <p className="text-sm text-gray-600">{selectedCompany.businessCommunity || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Estimated Annual Turnover</label>
                                        <p className="text-sm text-gray-600">
                                          {selectedCompany.estimatedAnnualTurnover 
                                            ? `AED ${selectedCompany.estimatedAnnualTurnover.toLocaleString()}`
                                            : 'N/A'
                                          }
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Formed Date</label>
                                        <p className="text-sm text-gray-600">
                                          {selectedCompany.formedAt ? new Date(selectedCompany.formedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">License Expiry</label>
                                        <p className={`text-sm ${isLicenseExpiringSoon(selectedCompany.licenseExpiryDate) ? 'text-red-600' : 'text-gray-600'}`}>
                                          {selectedCompany.licenseExpiryDate ? new Date(selectedCompany.licenseExpiryDate).toLocaleDateString() : 'N/A'}
                                          {selectedCompany.licenseExpiryDate && (
                                            <span className="ml-2">
                                              ({getDaysUntilExpiry(selectedCompany.licenseExpiryDate)} days)
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                      <h4 className="font-medium mb-2">Owner Information</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Owner Name</label>
                                          <p className="text-sm text-gray-600">{selectedCompany.ownerFullName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Owner Email</label>
                                          <p className="text-sm text-gray-600">{selectedCompany.ownerEmail}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="border-t pt-4">
                                      <h4 className="font-medium mb-2">Company Structure</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Shareholders</label>
                                          <p className="text-sm text-gray-600">{selectedCompany.shareholderCount}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Directors</label>
                                          <p className="text-sm text-gray-600">{selectedCompany.directorCount}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button size="sm" asChild>
                                        <Link href={`/admin/companies/${selectedCompany.id}/details`}>
                                          View Full Details
                                        </Link>
                                      </Button>
                                      <Button size="sm" variant="outline" asChild>
                                        <Link href={`/admin/companies/${selectedCompany.id}/documents`}>
                                          View Documents
                                        </Link>
                                      </Button>
                                      {isLicenseExpiringSoon(selectedCompany.licenseExpiryDate) && (
                                        <Button size="sm" variant="outline">
                                          Renewal Reminder
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

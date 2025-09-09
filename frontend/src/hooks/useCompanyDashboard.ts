import { useState, useEffect } from 'react'

interface CompanyDashboardData {
  company: {
    id: string
    name: string
    trade_name?: string
    free_zone: string
    status: string
    license_number?: string
    formation_progress: number
    status_display: string
    progress_percentage: number
    license_issued_at?: string
    license_renewal_date?: string
  }
  shareholders: Array<{
    id: string
    full_name: string
    type: string
    share_percentage?: number
    identification: {
      type: string
      number: string
      passport_expiry_date?: string
      emirates_id_expiry_date?: string
    }
    expiry_status: string
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    action_url?: string
    read: boolean
    created_at: string
  }>
  renewal_info?: {
    renewal_date: string
    days_until_renewal: number
    status: string
    urgency: string
  }
  documents: {
    trade_license?: string
    moa?: string
  }
}

interface UseCompanyDashboardOptions {
  companyId: string
  enabled?: boolean
}

interface UseCompanyDashboardReturn {
  data: CompanyDashboardData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCompanyDashboard({ 
  companyId, 
  enabled = true 
}: UseCompanyDashboardOptions): UseCompanyDashboardReturn {
  const [data, setData] = useState<CompanyDashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    if (!enabled || !companyId) return

    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/companies/${companyId}/dashboard`, {
      //   headers: {
      //     'Authorization': `Bearer ${await getToken()}`,
      //     'Content-Type': 'application/json'
      //   }
      // })

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`)
      // }

      // const result = await response.json()
      // if (!result.success) {
      //   throw new Error(result.error || 'Failed to fetch dashboard data')
      // }

      // Mock data for development
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      const mockData: CompanyDashboardData = {
        company: {
          id: companyId,
          name: 'Sample Tech Solutions LLC',
          trade_name: 'Sample Tech',
          free_zone: 'IFZA',
          status: 'issued',
          license_number: 'IFZA-2024-001234',
          formation_progress: 100,
          status_display: 'License Issued - Complete',
          progress_percentage: 100,
          license_issued_at: '2024-01-15T10:00:00Z',
          license_renewal_date: '2025-01-15T10:00:00Z'
        },
        shareholders: [
          {
            id: '1',
            full_name: 'John Smith',
            type: 'shareholder',
            share_percentage: 60,
            identification: {
              type: 'Passport',
              number: 'A1234567',
              passport_expiry_date: '2025-06-15'
            },
            expiry_status: 'warning'
          },
          {
            id: '2',
            full_name: 'Jane Doe',
            type: 'director',
            share_percentage: 40,
            identification: {
              type: 'Emirates ID',
              number: '784-1234-5678901-2',
              emirates_id_expiry_date: '2026-03-20'
            },
            expiry_status: 'valid'
          }
        ],
        notifications: [
          {
            id: '1',
            title: 'Passport Expiry Warning',
            message: 'John Smith\'s passport expires in 45 days. Please renew to avoid issues.',
            type: 'warning',
            action_url: `/companies/${companyId}/people/1`,
            read: false,
            created_at: '2024-01-10T10:00:00Z'
          },
          {
            id: '2',
            title: 'License Renewal Reminder',
            message: 'Your trade license renewal is due in 60 days.',
            type: 'info',
            read: false,
            created_at: '2024-01-09T10:00:00Z'
          }
        ],
        renewal_info: {
          renewal_date: '2025-01-15T10:00:00Z',
          days_until_renewal: 365,
          status: 'normal',
          urgency: 'low'
        },
        documents: {
          trade_license: 'https://example.com/trade-license.pdf',
          moa: 'https://example.com/moa.pdf'
        }
      }

      setData(mockData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      setError(errorMessage)
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [companyId, enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard
  }
}

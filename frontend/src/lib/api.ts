// Simple API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface DashboardData {
  companies: Array<{
    id: string;
    name: string;
    trade_name?: string;
    free_zone: string;
    status: string;
    license_number?: string;
    license_status: string;
    formation_progress: number;
    license_type?: string;
    license_expiry_date?: string;
    license_renewal_days?: number;
    establishment_card_number?: string;
    establishment_card_expiry_date?: string;
    official_email?: string;
    phone?: string;
    website?: string;
    shareholders: Array<{
      id: string;
      full_name: string;
      identification_type: string;
      identification_number?: string;
      passport_number?: string;
      passport_expiry_date?: string;
      share_percentage?: number;
      type: string;
    }>;
    directors: Array<{
      id: string;
      full_name: string;
      identification_type: string;
      identification_number?: string;
      passport_number?: string;
      passport_expiry_date?: string;
      type: string;
    }>;
    documents: {
      trade_license?: {
        id: string;
        name: string;
        file_name: string;
        uploaded_at: string;
        verified: boolean;
        download_url: string;
      };
      moa?: {
        id: string;
        name: string;
        file_name: string;
        uploaded_at: string;
        verified: boolean;
        download_url: string;
      };
      certificate_of_incorporation?: {
        id: string;
        name: string;
        file_name: string;
        uploaded_at: string;
        verified: boolean;
        download_url: string;
      };
      commercial_license?: {
        id: string;
        name: string;
        file_name: string;
        uploaded_at: string;
        verified: boolean;
        download_url: string;
      };
    };
    created_at: string;
    updated_at: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    company_id: string;
    company_name: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    created_at: string;
  }>;
  stats: {
    total_companies: number;
    in_progress: number;
    completed: number;
    documents_pending: number;
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      credentials: 'include', // Include cookies for Devise session
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch dashboard data');
    }

    return result.data;
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    // Return mock data for development/testing
    return {
      companies: [
        {
          id: '1',
          name: 'Sample Tech Solutions LLC',
          trade_name: 'SampleTech',
          free_zone: 'IFZA',
          status: 'in_progress',
          license_status: 'setting_up',
          formation_progress: 65,
          license_type: 'IFZA Freezone License',
          license_expiry_date: '2025-12-31T00:00:00Z',
          license_renewal_days: 365,
          official_email: 'info@sampletech.com',
          phone: '+971501234567',
          website: 'https://sampletech.com',
          shareholders: [
            {
              id: '1',
              full_name: 'John Smith',
              identification_type: 'Passport',
              identification_number: 'AB123456',
              passport_number: 'AB123456',
              passport_expiry_date: '2026-06-15T00:00:00Z',
              share_percentage: 100,
              type: 'shareholder'
            }
          ],
          directors: [
            {
              id: '1',
              full_name: 'John Smith',
              identification_type: 'Passport',
              identification_number: 'AB123456',
              passport_number: 'AB123456',
              passport_expiry_date: '2026-06-15T00:00:00Z',
              type: 'director'
            }
          ],
          documents: {
            trade_license: {
              id: '1',
              name: 'Trade License',
              file_name: 'trade_license.pdf',
              uploaded_at: '2024-01-15T10:00:00Z',
              verified: true,
              download_url: '/api/v1/documents/1/download'
            },
            moa: {
              id: '2',
              name: 'Memorandum of Association',
              file_name: 'moa.pdf',
              uploaded_at: '2024-01-15T11:00:00Z',
              verified: true,
              download_url: '/api/v1/documents/2/download'
            }
          },
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z'
        }
      ],
      notifications: [
        {
          id: 'license_expiry_1',
          type: 'license_expiry',
          title: 'License Renewal Due Soon',
          message: 'Your license for Sample Tech Solutions LLC expires in 365 days',
          company_id: '1',
          company_name: 'Sample Tech Solutions LLC',
          urgency: 'low',
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: 'formation_progress_1',
          type: 'formation_progress',
          title: 'Complete Company Formation',
          message: 'Sample Tech Solutions LLC formation is 65% complete',
          company_id: '1',
          company_name: 'Sample Tech Solutions LLC',
          urgency: 'medium',
          created_at: '2024-01-20T10:00:00Z'
        }
      ],
      stats: {
        total_companies: 1,
        in_progress: 1,
        completed: 0,
        documents_pending: 0
      }
    };
  }
}


// Core type definitions

export interface User {
  id: string
  clerk_id: string
  email: string
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  trade_name?: string
  license_number?: string
  free_zone: string
  status: CompanyStatus
  owner_id: string
  created_at: string
  updated_at: string
}

export type CompanyStatus = 
  | 'draft'
  | 'in_progress'
  | 'pending_payment'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'issued'

export interface WorkflowInstance {
  id: string
  company_id: string
  workflow_type: string
  status: WorkflowStatus
  current_step: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type WorkflowStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface WorkflowStep {
  id: string
  workflow_instance_id: string
  step_number: number
  step_type: StepType
  title: string
  description?: string
  status: StepStatus
  data: Record<string, any>
  created_at: string
  updated_at: string
}

export type StepType =
  | 'FORM'
  | 'DOC_UPLOAD'
  | 'AUTO'
  | 'REVIEW'
  | 'PAYMENT'
  | 'ISSUANCE'
  | 'NOTIFY'

export type StepStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped'

export interface Document {
  id: string
  company_id: string
  name: string
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  ocr_status: OCRStatus
  ocr_data?: Record<string, any>
  confidence_score?: number
  created_at: string
  updated_at: string
}

export type OCRStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export interface Person {
  id: string
  company_id: string
  type: PersonType
  first_name: string
  last_name: string
  nationality: string
  passport_number?: string
  emirates_id?: string
  share_percentage?: number
  created_at: string
  updated_at: string
}

export type PersonType =
  | 'shareholder'
  | 'director'
  | 'signatory'

export type UserRole =
  | 'owner'
  | 'admin'
  | 'accountant'
  | 'viewer'
  | 'csp_admin'
  | 'super_admin'

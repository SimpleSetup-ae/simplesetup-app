import { z } from 'zod'

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  clerk_id: z.string(),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// Company schemas
export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  trade_name: z.string().optional(),
  license_number: z.string().optional(),
  free_zone: z.string(),
  status: z.enum(['draft', 'in_progress', 'pending_payment', 'processing', 'approved', 'rejected', 'issued']),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  trade_name: z.string().optional(),
  free_zone: z.string().min(1, 'Free zone is required'),
  activity_codes: z.array(z.string()).min(1, 'At least one activity is required')
})

// Document schemas
export const DocumentUploadSchema = z.object({
  name: z.string().min(1),
  file_name: z.string().min(1),
  file_size: z.number().positive(),
  mime_type: z.string()
})

// Workflow schemas
export const WorkflowStepSchema = z.object({
  step_type: z.enum(['FORM', 'DOC_UPLOAD', 'AUTO', 'REVIEW', 'PAYMENT', 'ISSUANCE', 'NOTIFY']),
  title: z.string(),
  description: z.string().optional(),
  data: z.record(z.any())
})

// Person schemas
export const PersonSchema = z.object({
  type: z.enum(['shareholder', 'director', 'signatory']),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  nationality: z.string().min(1),
  passport_number: z.string().optional(),
  emirates_id: z.string().optional(),
  share_percentage: z.number().min(0).max(100).optional()
})

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    per_page: z.number(),
    total: z.number(),
    total_pages: z.number()
  })
})

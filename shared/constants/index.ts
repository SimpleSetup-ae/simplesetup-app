// Application constants

export const FREE_ZONES = {
  IFZA: 'IFZA - International Free Zone Authority',
  DIFC: 'DIFC - Dubai International Financial Centre',
  ADGM: 'ADGM - Abu Dhabi Global Market',
  DMCC: 'DMCC - Dubai Multi Commodities Centre',
  JAFZA: 'JAFZA - Jebel Ali Free Zone',
  RAKEZ: 'RAKEZ - Ras Al Khaimah Economic Zone'
} as const

export const COMPANY_STATUSES = {
  ANONYMOUS_DRAFT: 'anonymous_draft',
  DRAFT: 'draft',
  STARTED: 'started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  INFORMATION_REQUIRED: 'information_required',
  PENDING_PAYMENT: 'pending_payment',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ISSUED: 'issued',
  FORMED: 'formed',
  ACTIVE: 'active'
} as const

export const WORKFLOW_TYPES = {
  COMPANY_FORMATION: 'company_formation',
  TAX_REGISTRATION: 'tax_registration',
  VISA_PROCESSING: 'visa_processing',
  AMENDMENT: 'amendment'
} as const

export const STEP_TYPES = {
  FORM: 'FORM',
  DOC_UPLOAD: 'DOC_UPLOAD',
  AUTO: 'AUTO',
  REVIEW: 'REVIEW',
  PAYMENT: 'PAYMENT',
  ISSUANCE: 'ISSUANCE',
  NOTIFY: 'NOTIFY'
} as const

export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
  CSP_ADMIN: 'csp_admin',
  SUPER_ADMIN: 'super_admin'
} as const

export const DOCUMENT_TYPES = {
  PASSPORT: 'passport',
  EMIRATES_ID: 'emirates_id',
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement',
  NOC_LETTER: 'noc_letter',
  EDUCATIONAL_CERTIFICATE: 'educational_certificate',
  EXPERIENCE_LETTER: 'experience_letter',
  CORPORATE_DOCUMENTS: 'corporate_documents'
} as const

export const OCR_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const

export const SUPPORTED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  // Text
  'text/plain',
  'text/rtf',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed'
] as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const API_ROUTES = {
  AUTH: '/api/auth',
  COMPANIES: '/api/companies',
  WORKFLOWS: '/api/workflows',
  DOCUMENTS: '/api/documents',
  USERS: '/api/users',
  BILLING: '/api/billing'
} as const

## Audit Summary - Company Tab Implementation

### shadcn/ui components to reuse:
- Card, CardContent, CardHeader, CardTitle (existing in ui/)
- Button (existing in ui/)
- Badge (existing in ui/)
- Input (existing in ui/)
- Textarea (existing in ui/)
- Alert, AlertDescription, AlertTitle (existing in ui/)
- Separator (existing in ui/)

### Rails patterns to follow:
- Company model has `formation_data` JSONB field for form data storage
- Company model has `metadata` JSONB field for additional data
- Tax registration model exists with 90-day compliance tracking
- Documents model with Supabase storage integration
- Existing API serialization patterns in companies_controller.rb

### Supabase schema dependencies:
- Companies table: id, name, trade_name, free_zone, status, license_number, formation_data, metadata
- Tax_registrations table: company_id, registration_type, status, trn_number, registration_date
- Documents table: company_id, document_type, file_path, public_url, signed_url
- People table: company_id, type (shareholder/director), contact_info JSONB

### Clerk auth integration points:
- User model linked to companies via owner_id
- Company access control via can_be_accessed_by? method
- Current user available in API controllers

### Heroku deployment considerations:
- Supabase storage URLs for document thumbnails
- Environment variables for API endpoints
- CORS configuration for frontend requests

### Environment variables needed:
- SUPABASE_URL and SUPABASE_ANON_KEY for document access
- NEXT_PUBLIC_API_URL for backend API calls

### Database migrations required:
- Need to add missing company fields: website, official_email, phone, operating_name_arabic
- Need to add license-specific fields: license_type, first_issue_date, current_issue_date, expiry_date, establishment_card_number, establishment_card_issue_date, establishment_card_expiry_date

### API endpoints to create/modify:
- Enhance companies#show to include tax registration data, visa eligibility, license details
- Create companies#update endpoint for editable fields (website, email, phone)
- Create tax_registrations#create endpoint for "Register for Corporation Tax" action
- Enhance documents endpoint to filter by document_type for certificates

### Existing Frontend Components:
- CompanyDashboardPage at /companies/[id]/dashboard/page.tsx (needs company tab)
- Dashboard layout with sidebar navigation
- Existing mock data structure for company dashboard
- useCompanyDashboard hook for data fetching

### Missing Fields Analysis:
**Company Model Missing Fields:**
- website (editable)
- official_email (editable) 
- phone (editable)
- operating_name_arabic
- license_type
- first_license_issue_date  
- current_license_issue_date
- license_expiry_date
- establishment_card_number
- establishment_card_issue_date
- establishment_card_expiry_date

**Available Fields:**
- name (company name)
- free_zone (legal framework)
- formation_data JSONB (contains visa_count for employee visa eligibility)
- status (for license status mapping)
- license_number
- created_at (can be used for formation date calculation)

### Tax Registration 90-Day Counter Logic:
- Use company.created_at + 90.days for deadline
- Tax registration status from tax_registrations table
- Red alert if > 90 days, orange if > 60 days

### Document Types for Certificates:
- certificate_of_incorporation
- commercial_license  
- register_of_directors

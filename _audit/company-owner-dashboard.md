## Audit Summary - Company Owner Dashboard Improvement

### Existing Implementation Analysis

**Frontend Dashboard Structure:**
- Current location: `frontend/src/app/dashboard/page.tsx`
- Uses shadcn/ui components (Card, Button, etc.)
- Currently shows mock data with generic stats
- Has basic company list and activity feed
- Missing user-role specific filtering and real data integration

**Backend API Endpoints:**
- Companies API: `backend/app/controllers/api/v1/companies_controller.rb`
- Existing endpoints: GET `/api/v1/companies` (index), GET `/api/v1/companies/:id` (show)
- Already includes company ownership validation via `authorize_company_access`
- Rich serialization with company details, workflow progress, tax info, documents

**Database Schema Dependencies:**
- Companies table: Has all needed fields (name, status, license dates, contact info)
- People table: Contains shareholders/directors with passport data and expiry dates
- Documents table: Stores Trade License, MOA, and other documents with types
- Tax registrations: Corporate tax deadline tracking already implemented
- Company memberships: Role-based access control in place

**Authentication & Authorization:**
- Clerk integration with user roles
- Company ownership via `owner_id` foreign key
- Row-level security policies for data isolation
- User role validation: `company.can_be_accessed_by?(current_user)`

**Existing Patterns to Follow:**
- API response structure: `{ success: true, data: {...} }`
- Company serialization methods already comprehensive
- Authorization middleware pattern established
- shadcn/ui component usage consistent

### Implementation Plan

**New API Endpoint Needed:**
- `GET /api/v1/dashboard` - Company Owner specific dashboard data
- Include: company info, shareholders, documents, notifications, license renewal

**Frontend Changes:**
- Modify existing dashboard to be role-aware
- Add user parameter detection for Company Owner role
- Replace mock data with real API integration
- Implement simplified layout as requested

**Database Data Already Available:**
- Company formation status: `companies.status` and `formation_progress`
- Shareholders: `people` table with `type: 'shareholder'` and passport expiry
- Documents: `documents` table with `document_type` for Trade License, MOA
- License renewal: `companies.license_expiry_date` field exists
- Notifications: Can be derived from workflow steps and deadlines

**Security Considerations:**
- User can only see their own company data (owner_id match)
- RLS policies already in place for data isolation
- API authorization middleware validates company access

### Environment Variables Needed:**
- None - existing Clerk and API configuration sufficient

### No Duplicates to Avoid:**
- Company serialization methods already comprehensive
- Authorization patterns well established
- Database schema complete for requirements
- shadcn/ui components already imported and configured

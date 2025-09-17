# Client Sign-up Form Implementation Audit

## Overview
Complete replacement of existing company formation forms with a comprehensive 8-step client sign-up flow including anonymous drafts, OTP authentication, document uploads with OCR, live pricing, and admin dashboard.

## Current State Assessment

### Existing Components to Remove/Replace
- **Frontend Forms**: 
  - `/frontend/src/components/forms/company-formation-form.tsx` (563 lines)
  - `/frontend/src/components/forms/company-formation/` (entire directory)
  - `/frontend/src/app/companies/new/page.tsx`
  - `/frontend/src/app/company-formation-v2/page.tsx`
  - `/frontend/src/app/sign-up/page.tsx` (modify for OTP)

### Authentication System
- **Current**: Devise with email/password, Google OAuth, LinkedIn OAuth
- **Target**: Devise with SendGrid OTP for new forms
- **To Remove**: All Clerk references (none found in current codebase)

### Database Schema
- **Existing**: `companies` table with status field
- **Modifications Needed**:
  - Add `is_admin` boolean to `users` table
  - Add `draft_token` to `companies` table for anonymous drafts
  - Create `application_progress` table for tracking
  - Update `companies` status enum to include 'anonymous_draft'
  - Extend `documents` table for new document types

### Pricing Source
- **Source of Truth**: `/data/ifza-client-pricing.json`
- **Sync Required**: Ensure database pricing tables match JSON

### Storage Configuration
- **Supabase**: Already configured in .env
- **Bucket Structure**: `documents/companies/{company_id}/{document_type}/`
- **Document Types**: passports, emirates_id, visa, national_id, proof_of_address, coi, moa, board_resolution, good_standing, ubo_declaration

## Implementation Plan

### Phase 1: Database & Backend Setup
1. **Database Migrations**:
   - Add `is_admin` to users table
   - Add `draft_token`, `formation_type` to companies table
   - Add `anonymous_draft`, `submitted`, `under_review`, `information_required`, `formed` to company status enum
   - Create `application_progress` table
   - Add document type enums for new document categories

2. **Rails API Endpoints**:
   - `POST /api/v1/applications` - Create anonymous draft
   - `GET /api/v1/applications/:id` - Load application
   - `PATCH /api/v1/applications/:id` - Update with autosave
   - `PATCH /api/v1/applications/:id/progress` - Update progress
   - `GET /api/v1/pricing/quote` - Live pricing from JSON
   - `POST /api/v1/uploads/document` - Document upload to Supabase
   - `POST /api/v1/ocr/passport` - OCR extraction with GPT-5
   - `POST /api/v1/auth/send_otp` - SendGrid OTP
   - `POST /api/v1/auth/verify_otp` - OTP verification
   - `POST /api/v1/applications/:id/submit` - Final submission

### Phase 2: Frontend Multi-Step Form
1. **Page Structure** (`/app/application/[id]/`):
   - `start` - Create draft, show intro
   - `license` - License & visa configuration
   - `activities` - Business activities selection
   - `names` - Company name options
   - `shareholding` - Share structure
   - `members` - Shareholders/Directors with passport OCR
   - `ubos` - Ultimate Beneficial Owners
   - `review` - Review and submit

2. **Key Components**:
   - `ApplicationProvider` - Context for form state
   - `AutosaveHook` - Debounced autosave
   - `PricingBanner` - Live pricing display
   - `PassportUpload` - OCR extraction component
   - `ProgressIndicator` - Visual progress
   - `DocumentUpload` - Generic document handler

3. **State Management**:
   - Local storage for draft recovery
   - Cookie-based draft_token
   - React Hook Form with Zod validation
   - Optimistic UI updates

### Phase 3: Admin Dashboard
1. **Routes** (`/app/admin/`):
   - `applications` - List all applications
   - `applications/[id]` - View/process single application
   - `applications/[id]/documents` - Review uploaded documents
   - `applications/[id]/update` - Update status, add documents

2. **Admin Features**:
   - Filter by status (pending, under_review, formed)
   - Update application status
   - Upload final documents (Trade License, etc.)
   - Enter license data (License Number, dates, etc.)
   - Manage visa information

### Phase 4: Client Dashboard Updates
1. **Dashboard Enhancements**:
   - Show application status card
   - Notifications for information required
   - Document viewer for submitted docs
   - Download final documents when formed

## Technical Specifications

### OCR Integration
```javascript
// Primary: OpenAI GPT-5
model: "gpt-5"
// Fallback: Google Gemini 2.5 Pro
model: "gemini-2.5-pro"
```

### Document Types & Requirements
- **UAE Residents**: Passport, Emirates ID, UAE Visa
- **Outside UAE**: Passport, National ID (optional), Proof of Address
- **Corporate Owners**: COI, MOA/AOA, Board Resolution, Good Standing, UBO Declaration

### Validation Rules
- Names: No rude words, "Dubai", "Emirates", single word <2 letters
- Share Capital: Default ≤150k AED, >150k requires bank letter
- Partner Visa: Requires 48k AED × partner count
- PEP Check: Block if Politically Exposed Person

### Email Notifications (SendGrid)
- OTP for authentication
- Application submitted confirmation
- Information required notices
- Application approved/formed notification

## Security Considerations
- Admin routes protected by `is_admin` flag
- RLS policies for document access
- Sanitize OCR extracted data
- Validate all file uploads
- Rate limit OTP requests

## Migration Strategy
1. Deploy new forms at `/application/new`
2. Keep old forms temporarily inactive
3. Test with internal users
4. Switch default route when stable
5. Remove old forms after verification

## Success Metrics
- Draft recovery rate >90%
- OCR accuracy >95%
- Form completion rate >70%
- Average time to complete <20 minutes
- Admin processing time <5 minutes per application

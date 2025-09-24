# User Sign-Up Flow Integration Audit

## Overview
Adding a user sign-up step after the "Company Formation Application" page to capture user credentials and associate subsequent form steps with the authenticated user.

## Current State Analysis

### 1. Application Flow
**Current Process:**
- Anonymous users can start a company formation application
- Application creates a draft with a `draft_token` (stored in cookies)
- Users complete 4-step wizard:
  1. Business Activities
  2. Company Details  
  3. People & Ownership
  4. Documents Upload
- Applications have `status: 'anonymous_draft'` until claimed by a user
- Draft token mechanism exists for claiming applications after sign-up

**Key Components:**
- `/application/new` - Creates draft and redirects to start
- `/application/[id]/start` - Company Formation Application page
- `CompanyFormationWizard` - Main form orchestrator
- `api/v1/applications` controller - Handles draft creation and claiming

### 2. Authentication System

**Backend (Rails + Devise):**
- Full Devise implementation with modules:
  - database_authenticatable
  - registerable  
  - confirmable
  - recoverable
  - trackable
  - lockable
- User model has:
  - `email`, `password` fields
  - `phone_number`, `phone_verified` fields (already in schema)
  - OAuth support (Google, LinkedIn)
- OTP authentication system exists (`OtpController`)
- JWT token authentication available
- Session-based authentication primary method

**Frontend Components:**
- `AuthenticationModal` - Existing modal with email/password/OTP flow
- `/sign-up` page - Standalone sign-up page
- `/sign-in` page - Standalone sign-in page  
- `AuthProvider` - Context for authentication state
- `AuthGuard` - Component for protecting routes
- `lib/auth.ts` - Auth utility functions

### 3. Database Schema

**Users Table:**
- Has `phone_number` and `phone_verified` columns
- Has email confirmation fields from Devise
- Linked to companies via `owner_id`

**Companies Table:**
- Has `draft_token` for anonymous drafts
- Has `owner_id` for user association
- Status includes `anonymous_draft` state

**Application Progress Table:**
- Tracks step completion and percentage
- Linked to company_id

### 4. Existing Features to Reuse

**Components:**
- `AuthenticationModal` - Can be adapted for inline sign-up
- Form validation from existing auth components
- Email validation regex and password strength validation
- OTP system for email verification

**Backend:**
- `/api/v1/auth/register` endpoint
- `/api/v1/auth/send_otp` for email verification
- `/api/v1/applications/:id/claim` for associating draft with user
- Draft token mechanism
- Session management

**Missing Components:**
- International phone number input with country code picker
- Phone number OTP verification (SMS)
- Inline sign-up flow within application wizard
- Step to capture phone after email verification

## Implementation Requirements

### 1. User Flow Changes
```
Current: Start → Company Formation → Activities → Details → People → Documents → Submit
New:     Start → Company Formation → Sign Up/In → Phone → Activities → Details → People → Documents → Submit
```

### 2. Technical Requirements

**Frontend:**
1. Add sign-up step after Company Formation page
2. Create phone number capture step with international dialing code
3. Implement email verification flow (OTP or confirmation link)
4. Update wizard navigation to include new steps
5. Handle existing user login vs new user registration
6. Persist draft_token through authentication

**Backend:**
1. Update user registration to handle inline sign-up
2. Add phone number validation and formatting
3. Implement SMS OTP for phone verification (optional)
4. Ensure draft claiming works seamlessly
5. Update application flow to require authentication after first step

**Database:**
- No schema changes needed (phone fields exist)
- May need to add phone country code field

### 3. UI/UX Considerations

**Sign-Up Page Design:**
- Should match existing orange/white brand theme
- Use shadcn/ui components consistently
- Clear progress indication
- Smooth transition from anonymous to authenticated

**Phone Number Input:**
- International dialing code dropdown
- Format validation
- Visual feedback for valid/invalid numbers
- Option to skip (make optional initially)

**Email Verification:**
- Clear instructions
- Resend option with rate limiting
- Progress indication
- Alternative verification methods

### 4. Security Considerations
- Rate limiting on sign-up attempts
- Email verification required
- Secure draft token handling
- Session management across steps
- CORS configuration for API calls

## Dependencies
- shadcn/ui components
- React Hook Form for validation
- libphonenumber-js for phone validation
- International dialing codes data
- Email service (already configured)
- SMS service (future - Twilio/AWS SNS)

## Risk Assessment
- **Low Risk:** Database schema ready, auth system exists
- **Medium Risk:** Interrupting existing flow might confuse users
- **Mitigation:** Clear UI, save progress, allow resume

## Testing Requirements
1. New user registration flow
2. Existing user login flow  
3. Draft claiming after sign-up
4. Email verification process
5. Phone number validation
6. Session persistence
7. Error handling
8. Mobile responsiveness

## Deployment Considerations
- Environment variables for email service
- Phone verification service credentials (when added)
- Database migrations (none required)
- Heroku configuration updates

## Estimated Timeline
- **Phase 1** (2-3 days): Basic sign-up integration
- **Phase 2** (1-2 days): Phone number capture  
- **Phase 3** (1-2 days): Email verification
- **Phase 4** (1 day): Testing and refinements
- **Total**: 5-7 days

## Success Metrics
- User registration completion rate
- Time to complete sign-up
- Email verification rate
- Application completion rate post-signup
- User retention

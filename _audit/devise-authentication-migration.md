# Devise Authentication Migration Audit

## Current Clerk Implementation

### Backend (Rails API)
- **ClerkService**: JWT token verification and webhook handling (`backend/app/services/clerk_service.rb`)
- **ApplicationController**: Token-based authentication with Clerk verification
- **AuthController**: Clerk webhook handling for user sync
- **User Model**: Uses `clerk_id` field for Clerk integration
- **Gemfile**: `clerk-sdk-ruby` gem dependency

### Frontend (Next.js)
- **Middleware**: `@clerk/nextjs` authMiddleware protecting routes
- **Package.json**: `@clerk/nextjs` dependency
- **Components**: Various components using Clerk hooks and components

### Environment Variables to Remove/Replace
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY` 
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

## Devise Implementation Plan

### Database Schema Changes
- Remove `clerk_id` from users table
- Add Devise fields: `encrypted_password`, `reset_password_token`, `reset_password_sent_at`, `remember_created_at`, `confirmation_token`, `confirmed_at`, `confirmation_sent_at`
- Add OAuth provider fields: `provider`, `uid`, `google_token`, `linkedin_token`
- Add session management: `session_timeout` (default 24 hours)

### Gems to Add
- `devise` - Core authentication
- `omniauth` - OAuth framework
- `omniauth-google-oauth2` - Google OAuth
- `omniauth-linkedin-oauth2` - LinkedIn OAuth
- `omniauth-rails_csrf_protection` - CSRF protection

### Backend Changes Required
1. **User Model**: Add Devise modules and OAuth methods
2. **Controllers**: Replace Clerk authentication with Devise
3. **Routes**: Add Devise routes and OAuth callbacks
4. **Sessions**: Configure 24-hour timeout
5. **Client Isolation**: Ensure company access controls remain intact

### Frontend Changes Required
1. **Remove Clerk**: Uninstall `@clerk/nextjs`
2. **Authentication**: Create login/signup forms
3. **OAuth Buttons**: Google and LinkedIn login buttons
4. **Session Management**: Handle 24-hour sessions
5. **API Integration**: Update API calls for Devise authentication

### Security Considerations
- **Client Isolation**: Users can only access their own companies (already implemented via `can_access_company?`)
- **Session Security**: 24-hour timeout, secure cookies
- **OAuth Security**: Proper state validation and token handling
- **CSRF Protection**: Enable for OAuth flows

### Environment Variables to Add
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `DEVISE_SECRET_KEY`

## Migration Strategy
1. **Phase 1**: Install and configure Devise with database migrations
2. **Phase 2**: Add OAuth providers (Google, LinkedIn)
3. **Phase 3**: Update backend authentication logic
4. **Phase 4**: Remove Clerk from frontend and implement new auth UI
5. **Phase 5**: Test complete authentication flow
6. **Phase 6**: Remove Clerk dependencies and clean up

## Client Access Control Verification
- ✅ **Company Model**: `belongs_to :owner` ensures ownership
- ✅ **User Model**: `can_access_company?` method checks ownership/membership
- ✅ **CompanyMembership**: Role-based access control
- ✅ **BaseController**: `current_company` method respects user access
- ✅ **Authorization**: Company data filtered by user access

The existing client isolation is solid and will remain intact during the migration.

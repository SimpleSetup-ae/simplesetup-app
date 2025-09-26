# Company Contact Information Sync - Pre-Implementation Audit

## Current State

### 1. **Frontend Display (companies page)**
- Shows `Company Official Email` and `Company Phone` in the Company Information section
- Currently pulls from `company.official_email` and `company.phone` in the API response
- `official_email` returns null/undefined for most companies
- `phone` is being pulled from the primary shareholder's mobile/phone field

### 2. **Backend Dashboard Serializer**
Location: `backend/app/controllers/api/v1/dashboard_controller.rb`
- Line 128: `official_email: company.respond_to?(:official_email) ? company.official_email : nil`
- Line 129: `phone: company.respond_to?(:phone) ? company.phone : nil`
- The Company model doesn't have `official_email` or `phone` columns (errors in logs confirm this)
- Currently trying to call methods that don't exist on the Company model

### 3. **Companies Controller Show Method**
Location: `backend/app/controllers/api/v1/companies_controller.rb`
- Line 345: `company_phone: company.contact_phone || primary_shareholder.dig('mobile') || primary_shareholder.dig('phone')`
- Falls back to shareholder data when company.contact_phone is not available

### 4. **User Model**
Location: `backend/app/models/user.rb`
- Has `email` field (standard Devise)
- Has `phone_number` field (added via migration)
- Phone number is captured during registration flow

### 5. **Phone Number Capture Flow**
Location: `backend/app/controllers/api/v1/inline_registrations_controller.rb`
- `update_phone` method (lines 127-189) captures and validates phone number
- Stores formatted phone in `user.phone_number`
- Also has `skip_phone` method for users who skip phone entry

### 6. **Company Model Relationships**
- Company `belongs_to :owner, class_name: 'User'`
- Owner is the user who created/owns the company
- This relationship gives us access to owner's email and phone_number

## Issues Identified

1. **Method Missing Error**: Company model doesn't have `official_email` or `phone` methods
2. **Data Source Mismatch**: Currently trying to pull from non-existent company fields instead of owner's data
3. **Inconsistent Data**: Phone/email shown on companies page doesn't match the user who submitted the application

## Proposed Solution

### 1. Update Dashboard Serializer
Instead of calling non-existent methods on Company, use the owner relationship:
- `official_email` → `company.owner&.email`
- `phone` → `company.owner&.phone_number || company.contact_phone || shareholder_fallback`

### 2. Ensure Data Consistency
The owner's email and phone_number should be the primary source of truth for company contact information since they're the ones who submitted the application.

### 3. Include Owner in Query
Update the dashboard query to include owner to avoid N+1 queries:
```ruby
owned_companies = current_user.owned_companies
                              .includes(:owner, :shareholders, :directors, :documents, :tax_registrations)
```

## Implementation Plan

1. **Update `Api::V1::DashboardController#serialize_company_for_dashboard`**
   - Change line 128 to use `company.owner&.email`
   - Change line 129 to use `company.owner&.phone_number` with proper fallback

2. **Verify Phone Capture**
   - Confirm phone_number is being saved during registration
   - Check if existing companies have owners with phone_numbers populated

3. **Test Implementation**
   - Check dashboard endpoint returns correct data
   - Verify companies page displays owner's contact info
   - Ensure no N+1 queries are introduced

## Files to Modify

1. `backend/app/controllers/api/v1/dashboard_controller.rb` - Update serializer
2. No frontend changes needed - it already consumes the API response correctly

## Testing Requirements

1. Unit tests for dashboard serializer with owner data
2. Request specs for dashboard endpoint
3. Manual testing with test user "james.o.campion+test75@gmail.com"

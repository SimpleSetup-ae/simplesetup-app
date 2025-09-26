# Tax Calendar Feature Implementation Audit

## Audit Summary

**Date**: September 26, 2025
**Feature**: UAE Tax Calendar for Client Users on Accounting Page

### Existing Infrastructure Analysis

#### Frontend Components to Reuse:
- **shadcn/ui components**: Card, CardContent, CardHeader, CardTitle, Button, Badge, Calendar (Lucide icon)
- **Existing UI patterns**: Current accounting page layout with grid system
- **API integration**: Existing `apiGet` function for backend communication
- **Date formatting**: Built-in JavaScript date handling

#### Rails Patterns to Follow:
- **Tax Registration Model**: Existing `TaxRegistration` model with company associations
- **Controller Structure**: `Api::V1::TaxRegistrationsController` with proper authorization
- **Service Pattern**: Need to create `TaxCalendarService` following existing service patterns
- **Serialization**: Follow existing serialization patterns for API responses

#### Database Schema Dependencies:
- **Companies Table**: Has `incorporation_date`, `licence_issue_date`, `estimated_annual_turnover`
- **Tax Registrations Table**: Has `registration_type`, `effective_date`, `next_filing_date`, `annual_turnover`
- **No new migrations required**: Can calculate dates from existing data

#### Authentication Integration Points:
- **Current User Access**: Existing `current_user.can_access_company?(@company)` pattern
- **Role-based Access**: Client users with `owner`, `admin`, `accountant` roles can view
- **Company Context**: Tax calendar tied to user's accessible companies

#### API Endpoints to Create/Modify:
- **New Endpoint**: `GET /api/v1/tax_calendar` - returns calculated tax deadlines
- **Existing Endpoint**: Leverage `/api/v1/tax_registrations` for company tax data

#### Environment Variables Needed:
- **Timezone**: `UAE_TIMEZONE=Asia/Dubai` (if not already configured)
- **Holiday API**: Optional external UAE holidays API key

### Implementation Plan

#### 1. Backend Service (Tax Calendar Service)
- Create `app/services/tax_calendar_service.rb` with UAE tax rules
- Implement date calculations based on company incorporation/license dates
- Handle weekend/holiday adjustments per UAE rules
- Support different tax types: Corporate Tax, VAT, Excise Tax

#### 2. Backend Controller
- Add `tax_calendar` action to existing `TaxRegistrationsController`
- Return structured calendar data with deadlines and descriptions
- Ensure proper authorization for client access

#### 3. Frontend Component
- Create `components/accounting/TaxCalendar.tsx` component
- Replace static "Upcoming Deadlines" card with dynamic tax calendar
- Show next 3-6 months of tax deadlines
- Color-code by urgency and tax type

#### 4. Integration Points
- Connect to existing company data (incorporation dates, turnover)
- Use existing tax registration status to show relevant deadlines
- Maintain consistent UI/UX with current accounting page

### UAE Tax Rules Implementation
- **Corporate Tax**: 9-month rule for returns, 3-month registration rule
- **VAT**: 28-day filing rule with weekend adjustments
- **Excise Tax**: Monthly filing by 15th of following month
- **Weekend Handling**: Saturday/Sunday adjustments for VAT/Excise
- **Public Holidays**: Manual UAE holiday list integration

### No Architectural Changes Required
- Leverages existing authentication and company access patterns
- Uses established API and component structures
- No database schema changes needed
- Maintains current security and authorization model

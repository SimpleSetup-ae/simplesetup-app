# User Sign-Up Integration - Implementation Plan

## Executive Summary
Integrate a user registration flow into the company formation application process. After the initial "Company Formation Application" page, users will be prompted to create an account (or sign in) before continuing with the remaining steps.

## Detailed Implementation Plan

### Phase 1: Backend API Updates (Day 1-2)

#### 1.1 Update User Registration Controller
```ruby
# app/controllers/api/v1/auth/registrations_controller.rb
- Add inline registration endpoint
- Accept draft_token parameter
- Auto-claim draft after successful registration
- Return user token and redirect URL
```

#### 1.2 Phone Number Validation Service
```ruby
# app/services/phone_validation_service.rb
- Validate international format
- Parse country code
- Format for storage
- Check for duplicates (optional)
```

#### 1.3 Email Verification Enhancement
```ruby
# app/services/email_verification_service.rb
- Send OTP code via email
- Support both OTP and confirmation link
- Rate limiting (1 per minute)
- Expiry handling (15 minutes)
```

#### 1.4 Update Application Controller
```ruby
# app/controllers/api/v1/applications_controller.rb
- Modify flow to require auth after first step
- Update progress tracking for new steps
- Handle transition from anonymous to authenticated
```

### Phase 2: Frontend Components (Day 2-3)

#### 2.1 UserSignUpStep Component
```typescript
// src/components/forms/company-formation/steps/UserSignUpStep.tsx
interface UserSignUpStepProps {
  draftToken: string;
  onComplete: (user: User) => void;
  onSkip?: () => void;
}

Features:
- Email input with validation
- Password input with strength indicator
- Confirm password field
- Terms acceptance checkbox
- "Already have account?" toggle
- Loading states
- Error handling
```

#### 2.2 PhoneNumberStep Component  
```typescript
// src/components/forms/company-formation/steps/PhoneNumberStep.tsx
interface PhoneNumberStepProps {
  userId: string;
  onComplete: (phoneData: PhoneData) => void;
  onSkip?: () => void;
}

Features:
- Country code selector (dropdown)
- Phone number input
- Format validation
- Visual formatting (e.g., +971 50 123 4567)
- "Skip for now" option
- SMS verification (future)
```

#### 2.3 EmailVerificationStep Component
```typescript
// src/components/forms/company-formation/steps/EmailVerificationStep.tsx
interface EmailVerificationStepProps {
  email: string;
  userId: string;
  onVerified: () => void;
}

Features:
- OTP input (6 digits)
- Resend button with countdown
- Alternative: check email prompt
- Success animation
- Error states
```

#### 2.4 CountryCodeSelector Component
```typescript
// src/components/ui/country-code-selector.tsx
interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

Features:
- Searchable dropdown
- Flag icons
- Popular countries at top
- Keyboard navigation
- Mobile-friendly
```

### Phase 3: Wizard Integration (Day 3-4)

#### 3.1 Update CompanyFormationWizard
```typescript
// Modify step flow
const steps = [
  { id: 'company_basics', title: 'Company Formation Application' },
  { id: 'user_signup', title: 'Create Your Account' },      // NEW
  { id: 'email_verify', title: 'Verify Email' },           // NEW
  { id: 'phone_number', title: 'Contact Information' },     // NEW
  { id: 'business_activities', title: 'Business Activities' },
  { id: 'company_details', title: 'Company Details' },
  { id: 'people_ownership', title: 'People & Ownership' },
  { id: 'documents', title: 'Upload Documents' }
];
```

#### 3.2 State Management Updates
```typescript
// Add authentication state to form context
interface FormState {
  isAuthenticated: boolean;
  user: User | null;
  draftToken: string;
  formData: CompanyFormData;
  currentStep: number;
}
```

#### 3.3 Navigation Logic
```typescript
// Handle conditional navigation
- Skip auth steps if already logged in
- Preserve form data through auth flow  
- Handle browser back button
- Auto-save before auth steps
```

### Phase 4: UI/UX Design (Day 4-5)

#### 4.1 Sign-Up Page Design
```
┌─────────────────────────────────────┐
│       Create Your Account           │
├─────────────────────────────────────┤
│                                     │
│  To continue your application, we  │
│  need to create your account.      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Email Address               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Password                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Confirm Password            │   │
│  └─────────────────────────────┘   │
│                                     │
│  □ I agree to Terms & Conditions   │
│                                     │
│  [Create Account] [Sign In Instead] │
│                                     │
└─────────────────────────────────────┘
```

#### 4.2 Phone Number Page Design
```
┌─────────────────────────────────────┐
│      Contact Information            │
├─────────────────────────────────────┤
│                                     │
│  Please provide your phone number  │
│  for important updates.            │
│                                     │
│  ┌──────┬──────────────────────┐   │
│  │ +971 ▼│ 50 123 4567        │   │
│  └──────┴──────────────────────┘   │
│                                     │
│  [Continue]      [Skip for now]    │
│                                     │
└─────────────────────────────────────┘
```

### Phase 5: Testing (Day 5-6)

#### 5.1 Unit Tests
- Registration API endpoint
- Phone validation service
- Email verification service
- Frontend components
- Form state management

#### 5.2 Integration Tests  
- Complete sign-up flow
- Existing user login
- Draft claiming
- Session persistence
- Error scenarios

#### 5.3 E2E Tests
- Full application flow with sign-up
- Mobile responsiveness
- Browser compatibility
- Performance testing

### Phase 6: Deployment (Day 6-7)

#### 6.1 Environment Configuration
```env
# Email Service
EMAIL_FROM=noreply@simplesetup.ae
SENDGRID_API_KEY=...

# SMS Service (Future)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Frontend
NEXT_PUBLIC_API_URL=https://api.simplesetup.ae
```

#### 6.2 Database Migrations
- None required (fields exist)

#### 6.3 Deployment Steps
1. Deploy backend to Heroku staging
2. Deploy frontend to Vercel staging  
3. Test complete flow
4. Deploy to production
5. Monitor error rates

## Implementation Priority

### Must Have (MVP)
✅ User registration with email/password
✅ Email field validation
✅ Password strength requirements
✅ Draft token preservation
✅ Application claiming after sign-up
✅ Basic phone number input
✅ Session management

### Should Have
- Email verification (OTP)
- International phone code selector
- Remember me option
- Social login (Google/LinkedIn)
- Progress preservation

### Nice to Have
- Phone SMS verification
- Two-factor authentication
- Password recovery flow
- Account settings page
- User profile completion

## Code Examples

### Backend: Inline Registration Endpoint
```ruby
class Api::V1::Auth::InlineRegistrationsController < ApplicationController
  skip_before_action :authenticate_user!
  
  def create
    user = User.new(registration_params)
    user.skip_confirmation! # Will verify via OTP
    
    if user.save
      # Claim draft if token provided
      claim_draft(user) if params[:draft_token]
      
      # Send verification email
      UserMailer.verification_otp(user).deliver_later
      
      render json: {
        success: true,
        user: UserSerializer.new(user),
        next_step: 'email_verification'
      }
    else
      render json: {
        success: false,
        errors: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def registration_params
    params.permit(:email, :password, :password_confirmation)
  end
  
  def claim_draft(user)
    company = Company.find_by(draft_token: params[:draft_token])
    company&.claim_by_user!(user)
  end
end
```

### Frontend: Phone Number Input Component
```tsx
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countryCodes } from '@/lib/country-codes';

export function PhoneNumberInput({ 
  value, 
  onChange, 
  error 
}: {
  value: { countryCode: string; number: string };
  onChange: (value: { countryCode: string; number: string }) => void;
  error?: string;
}) {
  const [countryCode, setCountryCode] = useState(value.countryCode || '+971');
  const [phoneNumber, setPhoneNumber] = useState(value.number || '');
  
  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    onChange({ countryCode: code, number: phoneNumber });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value.replace(/\D/g, '');
    setPhoneNumber(number);
    onChange({ countryCode, number });
  };
  
  return (
    <div className="space-y-2">
      <Label>Phone Number</Label>
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.dialCode}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.dialCode}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handleNumberChange}
          placeholder="50 123 4567"
          className="flex-1"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

## Success Criteria

1. **User Experience**
   - Smooth transition from anonymous to authenticated
   - Clear progress indication
   - < 2 minutes to complete sign-up
   - Mobile-friendly interface

2. **Technical**
   - 99%+ successful registrations
   - < 500ms API response times
   - Zero data loss during transition
   - Proper error handling

3. **Business**
   - 80%+ completion rate
   - Reduced support tickets
   - Improved user data quality
   - Enhanced security

## Rollback Plan

If issues arise:
1. Feature flag to disable new flow
2. Revert to anonymous-only flow
3. Preserve user data
4. Clear communication to users

## Timeline Summary

- **Day 1-2**: Backend API development
- **Day 2-3**: Frontend components
- **Day 3-4**: Wizard integration
- **Day 4-5**: UI/UX refinements
- **Day 5-6**: Testing
- **Day 6-7**: Deployment

**Total Duration**: 7 working days

## Next Steps

1. Review and approve plan
2. Set up development branch
3. Begin backend API development
4. Create UI mockups for approval
5. Start implementation

## Questions to Address

1. Should email verification be mandatory or optional initially?
2. Do we want SMS verification for phone numbers from day 1?
3. Should existing users be able to claim multiple drafts?
4. What happens if user abandons sign-up mid-flow?
5. Do we need admin controls for user management?

## References

- [Current Authentication Docs](./authentication_consolidation.md)
- [Devise Migration](./devise-migration-complete.md)
- [Company Formation Flow](./company-formation-form-improvements.md)
- [API Documentation](/api/docs)



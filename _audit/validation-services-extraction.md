## Audit Summary
- **shadcn/ui components to reuse**: N/A (backend-focused)
- **Rails patterns to follow**: Service objects for business logic, PORO validators, dependency injection
- **Supabase schema dependencies**: Company model fields, Document model fields, User model fields
- **Clerk auth integration points**: None; Devise-only
- **Heroku deployment considerations**: None
- **Environment variables needed**: None
- **Database migrations required**: None
- **API endpoints to create/modify**: Update controllers to use centralized validation services

## Current Findings
- Validation logic scattered across controllers:
  - `ApplicationsController#validate_submission` - 14 hard-coded rules
  - `OtpController#valid_email?`, `#valid_password?` - basic auth validation
  - `PassportController#valid_file?` - file upload validation
  - `FormConfigsController#validate` - YAML form validation

## Plan
1. Create `app/services/validators/base_validator.rb`
2. Create `app/services/validators/company_submission_validator.rb`
3. Create `app/services/validators/auth_validator.rb`
4. Create `app/services/validators/file_validator.rb`
5. Create `app/services/validators/form_config_validator.rb`
6. Update controllers to use validators instead of inline logic

## Risks & Mitigations
- Risk: Validation rules change, affecting multiple places.
  - Mitigation: Single source of truth in validator services.
- Risk: Validation logic becomes too complex.
  - Mitigation: Keep validators focused on single responsibility.

## Verification Checklist
- [ ] Company submission validation returns same errors as before
- [ ] Email/password validation unchanged
- [ ] File validation unchanged
- [ ] Form config validation unchanged
- [ ] No controller methods remain with inline validation logic

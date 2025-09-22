## Audit Summary
- **shadcn/ui components to reuse**: Card, Button, Input, Label, Alert, Badge, Tabs, Select, Dialog
- **Rails patterns to follow**: Component decomposition, custom hooks for business logic, separation of concerns
- **Supabase schema dependencies**: None direct; uses application context
- **Clerk auth integration points**: None; Devise-only
- **Heroku deployment considerations**: None
- **Environment variables needed**: None
- **Database migrations required**: None
- **API endpoints to create/modify**: None; existing endpoints used

## Current Findings
- **MembersPage** (656 lines): Massive component handling:
  - Shareholder management (CRUD operations)
  - General Manager selection/creation
  - Person form data input (individual/corporate)
  - Passport upload with AI extraction
  - Validation logic
  - Navigation logic
  - State management for multiple entities

- **NamesPage** (393 lines): Large component handling:
  - Company name options management
  - Arabic name translation API integration
  - Validation and submission logic
  - State management for name options

- **ShareholdingPage** (395 lines): Large component handling:
  - Share capital calculation and management
  - Share value and total shares calculation
  - Voting rights configuration
  - Document uploads (bank letter, shareholders agreement)
  - Validation and submission logic

## Plan
1. **MembersPage Decomposition**:
   - Extract `PersonForm` component for individual/corporate person input
   - Extract `ShareholderManager` component for managing shareholders list
   - Extract `GeneralManagerSelector` component for GM selection/creation
   - Extract validation logic into `usePersonValidation` hook
   - Extract navigation logic into `useMemberNavigation` hook

2. **NamesPage Decomposition**:
   - Extract `CompanyNameForm` component for name input
   - Extract `NameOptionsList` component for displaying/sorting options
   - Extract validation logic into `useNameValidation` hook
   - Extract translation API logic into `useArabicTranslation` hook

3. **ShareholdingPage Decomposition**:
   - Extract `ShareCapitalCalculator` component for share calculations
   - Extract `VotingRightsForm` component for voting rights configuration
   - Extract document upload logic into reusable `DocumentUploadForm` component
   - Extract validation logic into `useShareholdingValidation` hook

## Risks & Mitigations
- Risk: Component decomposition breaks existing functionality.
  - Mitigation: Keep component interfaces stable, test each extracted component individually.
- Risk: State management becomes complex with multiple components.
  - Mitigation: Use application context for shared state, pass minimal props.
- Risk: Performance impact from additional component renders.
  - Mitigation: Use React.memo for pure components, optimize re-renders.

## Verification Checklist
- [ ] All extracted components render correctly with existing data
- [ ] Form submissions work the same as before
- [ ] Navigation flows work correctly
- [ ] Validation errors display properly
- [ ] No breaking changes to parent component interfaces

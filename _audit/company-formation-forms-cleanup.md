# Company Formation Forms Cleanup Audit

## Overview
This audit identifies all company formation forms in the codebase that need to be removed to simplify the application. The form being **KEPT** is the one at `/application/[id]/review` which is part of the comprehensive application workflow.

## Current Form Being Kept
- **Path**: `/application/[id]/review`
- **Type**: Review page component
- **Dependencies**: Uses ApplicationContext, PricingBanner, and various UI components
- **Status**: Production form - DO NOT REMOVE

## Forms to Remove

### 1. Company Formation V2 (Deprecated)
- **Path**: `/company-formation-v2/page.tsx`
- **Component**: `CompanyFormationWizard` from `@/components/forms/company-formation-v2`
- **Status**: Already marked as deprecated with comment
- **Dependencies**:
  - `CompanyFormationWizard` component
  - Associated pages: `CompanyBasicsPage`, `PeopleAndDocumentsPage`
  - Form configuration files

### 2. Demo Form (Test/Development)
- **Path**: `/demo-form/page.tsx`
- **Component**: Self-contained demo form
- **Status**: Demo/test form - safe to remove
- **Dependencies**: None - standalone component

### 3. Test Form (Test/Development)
- **Path**: `/test-form/page.tsx`
- **Component**: `CompanyFormationWizard` from `@/components/forms/company-formation`
- **Status**: Test page marked as deprecated
- **Dependencies**:
  - `CompanyFormationWizard` component from company-formation
  - Associated step components
  - Form hooks and utilities

### 4. Legacy Company Formation Form (Deprecated)
- **Path**: `/companies/new/page.tsx`
- **Component**: `CompanyFormationForm` from `@/components/forms/company-formation-form`
- **Status**: Already marked as deprecated
- **Dependencies**:
  - `CompanyFormationForm` component (564 lines)
  - Uses shared constants from `@simple-setup/shared`

### 5. Workflow/Passport Demo (Test/Development)
- **Path**: `/workflow/passport-demo/page.tsx`
- **Component**: `PassportUpload` demo
- **Status**: Demo page for testing passport upload functionality
- **Dependencies**:
  - `PassportUpload` component from workflow
  - Document upload interface

## Components and Dependencies Analysis

### Components to Remove:
1. **`/components/forms/company-formation-v2/`** (entire directory)
2. **`/components/forms/company-formation-form.tsx`** (single file)
3. **`/components/workflow/documents/PassportUpload.tsx`** (if only used by demo)
4. **`/components/forms/company-formation/`** (if only used by test-form)

### Components to Keep:
1. **`/components/application/`** - Used by the main application workflow
2. **`/components/forms/company-formation/`** - May have shared utilities used by main form

## Routes to Remove:
- `/company-formation-v2`
- `/demo-form`
- `/test-form`
- `/companies/new`
- `/workflow/passport-demo`

## Routes to Keep:
- `/application/[id]/` (entire workflow)
- `/application/new` (entry point)

## Backend Dependencies
- Check if any API endpoints are specifically tied to removed forms
- Verify application creation workflow still works with main form
- Ensure no backend services depend on removed frontend components

## Dependency Analysis Results

### ✅ Safe to Remove (No Dependencies on Main Application):
1. **`/company-formation-v2/`** - Only used by its own page, already deprecated
2. **`/demo-form/`** - Self-contained demo form, no dependencies
3. **`/test-form/`** - Test page using company-formation components, no main app usage
4. **`/companies/new/`** - Uses separate CompanyFormationForm component, already deprecated
5. **`/workflow/passport-demo/`** - Demo using workflow PassportUpload, main app uses different component

### ⚠️ Components to Remove Carefully:
1. **`/components/forms/company-formation-form.tsx`** - Standalone, no shared dependencies
2. **`/components/forms/company-formation-v2/`** - Entire directory, only used by v2 form
3. **`/components/workflow/documents/PassportUpload.tsx`** - Different from main app version
4. **`/components/forms/company-formation/`** - Only used by test-form, but check for shared utilities

### ✅ Components to Keep:
1. **`/components/application/PassportUpload.tsx`** - Used by main application workflow
2. **All application context and form components** - Used by main `/application/[id]/` workflow

## Removal Plan

### Phase 1: Remove Obvious Test/Demo Forms
1. **Remove `/demo-form/`** - Self-contained, no dependencies
2. **Remove `/workflow/passport-demo/`** - Demo page only
3. **Remove `/test-form/`** - Test page only

### Phase 2: Remove Deprecated Components
1. **Remove `/components/forms/company-formation-form.tsx`** - Standalone deprecated form
2. **Remove `/components/forms/company-formation-v2/`** - Entire v2 form directory
3. **Remove `/components/workflow/documents/PassportUpload.tsx`** - Demo component only

### Phase 3: Verify Company Formation Components
1. **Check if `/components/forms/company-formation/`** has any shared utilities used by main app
2. **If no shared dependencies found, remove entire directory**
3. **If shared utilities exist, extract them to shared location**

### Phase 4: Clean Up Routes
1. **Remove deprecated routes from middleware** (`/company-formation`)
2. **Verify all deprecated pages are removed**
3. **Test that main application workflow still works**

## Files to Remove:
```
frontend/src/app/
├── company-formation-v2/page.tsx
├── demo-form/page.tsx
├── test-form/page.tsx
├── companies/new/page.tsx
└── workflow/passport-demo/page.tsx

frontend/src/components/forms/
├── company-formation-form.tsx
└── company-formation-v2/ (entire directory)

frontend/src/components/workflow/documents/
└── PassportUpload.tsx
```

## Files to Keep:
```
frontend/src/app/application/ (entire workflow - keep)
frontend/src/components/application/PassportUpload.tsx
frontend/src/components/application/ (entire directory - keep)
frontend/src/contexts/ApplicationContext.tsx
```

## Verification Steps:
1. [ ] Ensure main application workflow `/application/[id]/` works after removal
2. [ ] Verify no 404 errors on navigation
3. [ ] Check that all imports resolve correctly
4. [ ] Test application creation flow still works
5. [ ] Verify no console errors in browser

## Next Steps:
1. Start with Phase 1 removals (test/demo forms)
2. Test main application workflow
3. Proceed with Phase 2 (deprecated components)
4. Final cleanup and verification

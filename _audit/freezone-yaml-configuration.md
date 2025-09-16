# Freezone YAML Configuration Audit

## Audit Summary
- **Existing workflow system**: Full YAML-based workflow engine already implemented
- **Rails patterns to follow**: WorkflowService, YamlParser, StepValidator, step handlers
- **Supabase schema dependencies**: Freezone, PricingCatalog, WorkflowInstance, WorkflowStep tables
- **Generic components needed**: Passport Upload, Emirates ID Upload, Utility Bill Upload, NOC Letter, Business Activity Selection
- **Environment variables needed**: None additional
- **Database migrations required**: None - existing schema supports this
- **API endpoints to create/modify**: None - existing workflow endpoints sufficient

## Current Architecture Analysis

### 1. Existing YAML Workflow System
- **Location**: `config/workflows/` directory
- **Parser**: `backend/app/services/workflow/yaml_parser.rb`
- **Service**: `backend/app/services/workflow_service.rb`
- **Step Types**: FORM, DOC_UPLOAD, AUTO, REVIEW, PAYMENT, ISSUANCE, NOTIFY
- **Validation**: Built-in field validation with rules
- **Current Implementation**: IFZA workflow fully configured

### 2. Database Structure
- **Freezones Table**: Already exists with code, name, metadata
- **Active Freezones**: IFZA, MEYDAN, SHAMS, AJMAN
- **Inactive**: DIFC, ADGM (higher requirements)
- **Pricing**: Separate pricing catalog per freezone

### 3. Component Reusability Opportunities

#### Generic Document Upload Components
1. **Passport Upload**
   - Used by: All freezones
   - Variations: Single/Multiple, Shareholder/Director
   - OCR Integration: Already exists

2. **Emirates ID Upload**
   - Used by: All freezones
   - Variations: Required/Optional based on residency
   - OCR Integration: Can be added

3. **Utility Bill Upload**
   - Used by: All freezones
   - Purpose: Address proof
   - Validation: Date within 3 months

4. **NOC Letter Upload**
   - Used by: Most freezones
   - Variations: Required for UAE residents with employment
   - Template: Can provide standard template

#### Generic Form Components
1. **Business Activity Selection**
   - Used by: All freezones
   - Variations: Different activity lists per freezone
   - Pricing: Activity-based fees vary

2. **Shareholder Information**
   - Used by: All freezones
   - Validation: Total shareholding = 100%
   - Limits: Vary by freezone (1-50 shareholders)

3. **Company Name**
   - Used by: All freezones
   - Validation: Name availability check
   - Rules: Freezone-specific naming conventions

## Proposed YAML Structure

### Freezone-Specific YAML Files
```
config/workflows/
├── ifza_company_formation.yml (existing)
├── meydan_company_formation.yml (new)
├── shams_company_formation.yml (new)
├── ajman_company_formation.yml (new)
└── shared/
    ├── document_requirements.yml
    └── form_fields.yml
```

### YAML Structure Enhancement
```yaml
# Example: meydan_company_formation.yml
name: "Meydan Company Formation"
free_zone: "MEYDAN"
extends: "shared/base_formation" # Inherit common steps

# Override specific requirements
requirements:
  documents:
    passport_copy:
      inherit: true
      additional_validation:
        - "Must be valid for 6+ months"
    
    bank_reference_letter: # Meydan-specific
      title: "Bank Reference Letter"
      required: true
      description: "Letter from bank confirming account standing"
  
  shareholding:
    min_shareholders: 1
    max_shareholders: 10 # Meydan limit
    allow_corporate: true # Meydan allows corporate shareholders
  
  business_activities:
    max_activities: 3
    restricted: ["manufacturing", "banking"]
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create base YAML template with common requirements
2. Extend YamlParser to support inheritance/extends
3. Create shared component definitions

### Phase 2: Generic Components

#### Frontend Components
```typescript
// components/workflow/documents/PassportUpload.tsx
interface PassportUploadProps {
  required: boolean
  multiple: boolean
  entityType: 'shareholder' | 'director'
  onUpload: (files: File[]) => void
}

// components/workflow/forms/BusinessActivitySelect.tsx
interface BusinessActivitySelectProps {
  freezone: string
  maxActivities: number
  restrictedActivities: string[]
  onChange: (activities: string[]) => void
}
```

#### Backend Handlers
```ruby
# app/services/workflow/component_handlers/passport_handler.rb
module Workflow
  module ComponentHandlers
    class PassportHandler < BaseHandler
      def validate(file, requirements)
        # OCR validation
        # Expiry date check
        # Format validation
      end
    end
  end
end
```

### Phase 3: Freezone-Specific YAMLs
1. Create YAML for each active freezone
2. Define specific requirements and variations
3. Configure pricing and fees

## Benefits of This Approach

1. **Maintainability**: Single source of truth for each freezone
2. **Scalability**: Easy to add new freezones
3. **Consistency**: Shared components ensure uniform UX
4. **Flexibility**: Override capability for specific requirements
5. **Efficiency**: Reuse existing workflow engine
6. **Compliance**: Easy to update when regulations change

## Risks & Mitigations

1. **Risk**: YAML complexity grows
   - **Mitigation**: Use inheritance and shared components

2. **Risk**: Component variations become unwieldy
   - **Mitigation**: Use composition pattern with props

3. **Risk**: Validation rules conflict
   - **Mitigation**: Clear precedence rules (specific > general)

## Next Steps

1. ✅ Audit complete
2. Create shared component definitions
3. Implement generic upload components
4. Create Meydan YAML as proof of concept
5. Test end-to-end workflow



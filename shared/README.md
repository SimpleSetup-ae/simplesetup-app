# Shared - Common Types and Utilities

Shared TypeScript types, schemas, and utilities used across frontend, mobile, and automations.

## Contents

- **Types**: TypeScript interfaces and type definitions
- **Schemas**: Zod validation schemas
- **Constants**: Application constants and enums

## Usage

```typescript
import { Company, CreateCompanySchema, FREE_ZONES } from '@simple-setup/shared'

// Use types for TypeScript
const company: Company = { ... }

// Use schemas for validation
const validatedData = CreateCompanySchema.parse(formData)

// Use constants
const freeZone = FREE_ZONES.IFZA
```

## Development

- Build: `npm run build`
- Watch: `npm run dev`
- Lint: `npm run lint`
- Type check: `npm run type-check`

# UAE Company Formation SaaS - Implementation ToDo

## Project Overview
Multi-company formation platform with web (Next.js) + mobile (Expo) frontends, Rails API backend, Playwright automation, and LLM-powered document processing.

## Phase 1: Foundation & MVP (Weeks 1-4)

### 1. Project Setup & Infrastructure
- [ ] Initialize monorepo structure with proper directory organization
  - [ ] `/backend` - Rails API
  - [ ] `/frontend` - Next.js web app
  - [ ] `/mobile` - Expo React Native app
  - [ ] `/automations` - Playwright workers
  - [ ] `/shared` - Common types/schemas
- [ ] Create `.env` template with all required keys
- [ ] Setup `start.sh` script for local development
  - [ ] Start Supabase local instance
  - [ ] Start Redis
  - [ ] Start Rails server
  - [ ] Start Next.js dev server
  - [ ] Start Sidekiq workers
- [ ] Configure Docker Compose for local services

### 2. Authentication & Authorization (Clerk Integration)
- [ ] Setup Clerk account and configure applications
  - [ ] Web application
  - [ ] Mobile application
  - [ ] Configure Google OAuth
  - [ ] Configure Microsoft OAuth
  - [ ] Configure Email/OTP authentication
- [ ] Implement Rails JWT verification middleware
- [ ] Create session management for landing page capture
  - [ ] Store pre-signup form data in session
  - [ ] Transfer to user account on signup
- [ ] Setup role-based permissions (Pundit)
  - [ ] Owner role policies
  - [ ] Admin role policies
  - [ ] Accountant role policies
  - [ ] Viewer role policies
  - [ ] CSP Admin policies
  - [ ] SuperAdmin policies

### 3. Database & Models (Rails + Supabase)
- [ ] Setup Supabase project and local instance
- [ ] Configure Rails to use Supabase Postgres
- [ ] Create and run migrations
  - [ ] Enable UUID extension
  - [ ] Core tables migration
  - [ ] Add indexes and constraints
- [ ] Implement Rails models with associations
  - [ ] User model with Clerk integration
  - [ ] Company model with ownership
  - [ ] CompanyMembership for roles
  - [ ] WorkflowInstance and WorkflowStep
  - [ ] Document with encryption
  - [ ] Person (shareholders/directors)
  - [ ] Request model
  - [ ] TaxRegistration
  - [ ] BillingAccount
  - [ ] AuditLog
- [ ] Setup soft deletes where needed
- [ ] Configure model validations and callbacks

### 4. Workflow Engine (YAML-driven)
- [ ] Create workflow YAML parser
- [ ] Implement IFZA workflow configuration
  - [ ] Define all steps in YAML
  - [ ] Configure required fields
  - [ ] Setup document requirements
  - [ ] Define automation triggers
- [ ] Build workflow instance manager
  - [ ] State machine for workflow progression
  - [ ] Step execution logic
  - [ ] Validation framework
- [ ] Create step type handlers
  - [ ] FORM step renderer
  - [ ] DOC_UPLOAD handler
  - [ ] AUTO step executor
  - [ ] REVIEW step interface
  - [ ] PAYMENT step integration
  - [ ] ISSUANCE step handler
  - [ ] NOTIFY step sender

### 5. Document Pipeline (OCR/LLM)
- [ ] Setup Google Gemini 2.5 Pro integration
- [ ] Setup OpenAI GPT-4o integration
- [ ] Implement document upload flow
  - [ ] Create drag-and-drop upload component
    - [ ] Visual drop zone with dashed border
    - [ ] Drag hover state with gradient highlight
    - [ ] File preview on drop before upload
    - [ ] Multiple file selection support
  - [ ] Add traditional file upload button
    - [ ] Custom styled button matching design system
    - [ ] File browser integration
    - [ ] Batch upload capability
  - [ ] Configure broad file type support
    - [ ] Images: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG, HEIC, HEIF
    - [ ] Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ODT, ODS
    - [ ] Text: TXT, RTF, CSV
    - [ ] Archives: ZIP, RAR, 7Z (for bulk uploads)
    - [ ] Set max file size limits (50MB default, configurable)
  - [ ] Raw file storage implementation
    - [ ] Store original uploaded files unchanged
    - [ ] Generate unique storage keys with timestamps
    - [ ] Maintain file metadata (original name, MIME type, size)
    - [ ] Create file versioning system
  - [ ] Pre-signed URL generation for secure uploads
  - [ ] Virus scanning integration
  - [ ] Supabase Storage configuration
    - [ ] Create separate buckets for raw and processed files
    - [ ] Configure bucket policies
- [ ] Build OCR processing pipeline
  - [ ] DocumentOcrJob implementation (using google Gemini)
  - [ ] Field extraction logic (by returning json values from gemini)
  - [ ] Confidence scoring (if needed)
  - [ ] MRZ parsing
  - [ ] Keep processed versions alongside raw files
- [ ] Implement PII encryption
  - [ ] AES-256-GCM encryption (if needed on supabase)
  - [ ] Per-tenant data keys
  - [ ] Key management system

### 6. Core API Endpoints
- [ ] Authentication endpoints
  - [ ] POST /auth/sessions/verify
  - [ ] Clerk webhook handler
- [ ] Company management
  - [ ] GET /companies (list)
  - [ ] POST /companies (create)
  - [ ] GET /companies/:id (details)
  - [ ] PATCH /companies/:id (update)
- [ ] Workflow endpoints
  - [ ] GET /companies/:id/workflow
  - [ ] POST /companies/:id/workflow/start
  - [ ] POST /workflow_steps/:id/complete
  - [ ] POST /workflow_steps/:id/run_automation
- [ ] Document endpoints
  - [ ] POST /documents/upload_url
  - [ ] POST /documents (finalize)
  - [ ] POST /documents/:id/ocr
  - [ ] GET /documents/:id
- [ ] Request management
  - [ ] POST /requests
  - [ ] GET /requests
  - [ ] PATCH /requests/:id

### 7. Design System & Theme Configuration
- [ ] Create global design system with abstracted theme
  - [ ] Setup CSS variables for consistent theming
  - [ ] Configure color palette with gradients
    - [ ] Text gradients: black to silver (#000000 → #C0C0C0)
    - [ ] Button gradients: orange to silver (#FFA500 → #C0C0C0)
    - [ ] Define gradient stops and directions
  - [ ] Typography configuration
    - [ ] Merriweather for headings and large text
    - [ ] Inter for body text and UI elements
    - [ ] Define font size scale (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
    - [ ] Set line heights and letter spacing
  - [ ] Spacing system (4px base unit)
  - [ ] Border radius tokens
  - [ ] Shadow tokens for depth
- [ ] Configure shadcn/ui theme
  - [ ] Customize default components for minimalist aesthetic
  - [ ] Override component styles to match design system
  - [ ] Create custom variants for buttons, cards, forms
- [ ] Setup Lucide icons
  - [ ] Configure icon size tokens
  - [ ] Create icon color system
  - [ ] Define consistent icon usage patterns
- [ ] Build component library
  - [ ] Typography components (H1-H6, Body, Caption)
  - [ ] Button variants (primary, secondary, ghost, outline)
  - [ ] Card components with subtle shadows
  - [ ] Form elements with consistent styling
  - [ ] Navigation components
  - [ ] Status indicators and badges
- [ ] Create style utilities
  - [ ] Gradient text utility classes
  - [ ] Gradient button utility classes
  - [ ] Animation utilities for micro-interactions
  - [ ] Responsive utility classes

### 8. Frontend Foundation (Next.js + shadcn/ui)
- [ ] Setup Next.js 14 with TypeScript
- [ ] Install and configure shadcn/ui with custom theme
- [ ] Import and configure fonts
  - [ ] Add Merriweather from Google Fonts
  - [ ] Add Inter from Google Fonts
  - [ ] Configure font loading optimization
- [ ] Setup Clerk provider
- [ ] Configure TanStack Query
- [ ] Implement Zod schemas
- [ ] Create layout structure
  - [ ] Navigation component with minimalist design
  - [ ] Company selector with gradient accents
  - [ ] User menu with subtle animations
- [ ] Build very basic placeholder landing page. The data caputure and landing page has been built and in another repo
  - [ ] Hero section 
  - [ ] Activity selection with custom dropdowns
  - [ ] Contact information with validation
  - [ ] Session storage integration

### 9. Core Frontend Screens after login
- [ ] Dashboard
  - [ ] Company overview cards with gradient borders
  - [ ] Progress visualization with orange accents
  - [ ] Deadline tracker with minimalist timeline
  - [ ] Quick actions with hover gradients
- [ ] Formation Stepper
  - [ ] YAML-driven form generation
  - [ ] Dynamic field rendering with consistent styling
  - [ ] Validation display with subtle error states
  - [ ] Progress indicator with gradient fill
- [ ] Documents Module
  - [ ] Upload interface with dual upload methods
    - [ ] Drag-drop zone with gradient border animation
    - [ ] Upload button with orange gradient on hover
    - [ ] Progress bars with gradient fill during upload
    - [ ] File type icons from Lucide
  - [ ] Document list with status badges
    - [ ] Show original filename and upload date
    - [ ] File size and type indicators
    - [ ] Processing status (uploaded/processing/completed/failed)
    - [ ] Download raw file option
  - [ ] OCR results viewer with confidence indicators
    - [ ] Side-by-side view (document preview + extracted data)
    - [ ] Confidence scores with color coding
    - [ ] Highlight extracted regions on hover
  - [ ] Field verification UI with inline editing
    - [ ] Editable fields with validation
    - [ ] Accept/reject extracted values
    - [ ] Manual override capability
- [ ] My Business
  - [ ] License display with download button
  - [ ] Company details in minimalist cards
  - [ ] Activity codes with icon representations
  - [ ] Shareholder cap table with clean grid layout

## Phase 2: Automation & Payments (Weeks 5-8)

### 10. Playwright Automation Framework (Icebox this to the end. Make it possible for CSP Administrator to carry things out manually at this stage. Automation is Iceboxed until after MVP)
- [ ] Setup Node.js worker environment
- [ ] Create automation runner service
- [ ] Implement IFZA portal automations
  - [ ] Login automation
  - [ ] Profile creation
  - [ ] Document upload
  - [ ] Status checking
- [ ] Build retry mechanism with backoff
- [ ] Implement screenshot capture
- [ ] Create logging framework
- [ ] Setup worker orchestration from Rails

### 11. Stripe Integration
- [ ] Configure Stripe account (sandbox mode)
- [ ] Create product catalog
  - [ ] Formation products (IFZA, DIFC)
  - [ ] Tax registration products
  - [ ] Accounting tier subscriptions
- [ ] Implement billing endpoints
  - [ ] POST /billing/:company_id/subscribe
  - [ ] GET /billing/:company_id
  - [ ] POST /webhooks/stripe
- [ ] Build subscription management UI
  - [ ] Plan selection cards with gradient borders
  - [ ] Pricing display with Merriweather numbers
  - [ ] Feature comparison table with Lucide icons
  - [ ] Tier recommendation logic with highlighted suggestion
  - [ ] Upgrade/downgrade flow with confirmation modal
- [ ] Implement one-off payments
  - [ ] Tax registration orders with orange CTA buttons
  - [ ] Additional services catalog
  - [ ] Payment form with minimalist design
- [ ] Create invoice management
  - [ ] Invoice list with clean table layout
  - [ ] Download buttons with gradient hover
  - [ ] Payment history timeline
  - [ ] Receipt preview modal

### 12. Tax & VAT Module
- [ ] Build tax registration tracking
  - [ ] Corporate Tax (CT) status
  - [ ] VAT registration status
  - [ ] TRN management
- [ ] Create tax dashboard UI
  - [ ] Registration status cards
  - [ ] Due date calendar
  - [ ] Filing checklist
- [ ] Implement one-click registration
  - [ ] Order creation flow
  - [ ] Payment integration
  - [ ] Workflow triggering

### 12. Request Management System
- [ ] Define request types
  - [ ] Name change
  - [ ] Shareholder changes
  - [ ] Activity changes
  - [ ] NOC letters
- [ ] Build request creation forms
- [ ] Implement approval workflow
- [ ] Create request tracking UI

## Phase 3: Advanced Features (Weeks 9-12)

### 13. Visa Management Module
- [ ] Create visa data models
- [ ] Build visa workflow
  - [ ] Entry permit stage
  - [ ] Medical stage
  - [ ] EID biometrics
  - [ ] Stamping
  - [ ] Issuance
- [ ] Implement visa UI
  - [ ] Kanban board by stage
  - [ ] Timeline view
  - [ ] Document requirements
- [ ] Setup visa reminders

### 14. Multi-Company Support
- [ ] Implement company switching
- [ ] Build company invitation system
- [ ] Create role management UI
- [ ] Setup cross-company navigation

### 15. Mobile App (Expo)
- [ ] Setup Expo project
- [ ] Configure Clerk for mobile
- [ ] Implement core screens
  - [ ] Login/signup
  - [ ] Dashboard
  - [ ] Documents
  - [ ] Notifications
- [ ] Setup push notifications
- [ ] Build offline support

### 16. Notification System
- [ ] Setup email provider (using SendGrid)
- [ ] Create email templates
  - [ ] Welcome emails
  - [ ] Step completion
  - [ ] Payment confirmations
  - [ ] License issuance
  - [ ] Deadline reminders
- [ ] Implement in-app notifications
- [ ] Build notification preferences

## Phase 4: Production Readiness

### 17. Security Hardening
- [ ] Implement rate limiting
- [ ] Setup CORS properly
- [ ] Configure CSP headers
- [ ] Audit PII encryption
- [ ] Implement secret rotation
- [ ] Setup 2FA for admin accounts
- [ ] Configure backup encryption

### 18. Performance Optimization (this can be iceboxs if any blockers)
- [ ] Implement caching strategy
  - [ ] Redis caching
  - [ ] CDN setup
  - [ ] API response caching
- [ ] Optimize database queries
  - [ ] Add missing indexes
  - [ ] N+1 query prevention
  - [ ] Query optimization
- [ ] Frontend optimization
  - [ ] Code splitting
  - [ ] Image optimization
  - [ ] Bundle size reduction

### 19. Monitoring & Observability
- [ ] Setup logging infrastructure
  - [ ] Structured JSON logging
  - [ ] Request ID tracking
  - [ ] PII redaction in logs
- [ ] Configure monitoring
  - [ ] OpenTelemetry setup
  - [ ] Metrics collection
  - [ ] Custom dashboards
- [ ] Implement alerting
  - [ ] Automation failures
  - [ ] Payment failures
  - [ ] OCR errors
  - [ ] System health

### 20. Testing & Quality Assurance
- [ ] Write unit tests
  - [ ] Rails model specs
  - [ ] Service object specs
  - [ ] Controller specs
- [ ] Create integration tests
  - [ ] API endpoint tests
  - [ ] Workflow tests
  - [ ] Payment flow tests
- [ ] Build E2E tests
  - [ ] Critical user journeys
  - [ ] Multi-role scenarios
  - [ ] Error handling
- [ ] Security testing
  - [ ] JWT verification
  - [ ] Role bypass attempts
  - [ ] PII encryption verification

### 21. DevOps & Deployment
- [ ] Setup Heroku deployment (simple-setup-app)
  - [ ] Configure buildpacks for Rails API
  - [ ] Setup environment variables in Heroku config
  - [ ] Configure add-ons (Postgres, Redis, etc.)
- [ ] Implement CI/CD pipeline
  - [ ] Automated testing
  - [ ] Build verification
  - [ ] Deployment automation
- [ ] Configure backups
  - [ ] Database backups
  - [ ] Document backups
  - [ ] Backup testing

### 22. Documentation
- [ ] API documentation
  - [ ] OpenAPI specification
  - [ ] Authentication guide
  - [ ] Rate limits
- [ ] Developer documentation
  - [ ] Setup instructions
  - [ ] Architecture overview
  - [ ] Workflow creation guide
- [ ] User documentation
  - [ ] Getting started guide
  - [ ] Feature tutorials
  - [ ] FAQ section

## Ongoing Tasks

### Maintenance & Operations
- [ ] Monitor automation success rates
- [ ] Review OCR accuracy metrics
- [ ] Analyze user behavior patterns
- [ ] Update free zone configurations
- [ ] Rotate secrets quarterly
- [ ] Test disaster recovery monthly
- [ ] Review audit logs weekly
- [ ] Update dependencies regularly

### Business Operations
- [ ] Onboard new free zones
- [ ] Update pricing tiers
- [ ] Refine OCR models
- [ ] Optimize automation scripts
- [ ] Gather user feedback
- [ ] Implement feature requests
- [ ] Monitor compliance requirements

## Success Metrics
- [ ] API response time < 300ms (P95)
- [ ] OCR processing < 60s
- [ ] Automation success rate > 95%
- [ ] System availability > 99.9%
- [ ] Document upload success > 99%
- [ ] Payment processing success > 99.5%

## Notes
- Start with IFZA implementation as pilot
- Use sandbox environments for all integrations initially
- Prioritize security and compliance from day one
- Focus on user experience and automation reliability
- Maintain audit trails for all sensitive operations
- Implement gradual rollout for new features


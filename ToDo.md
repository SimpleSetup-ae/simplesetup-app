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
  - [ ] Pre-signed URL generation
  - [ ] Virus scanning integration
  - [ ] Supabase Storage configuration
- [ ] Build OCR processing pipeline
  - [ ] DocumentOcrJob implementation
  - [ ] Field extraction logic
  - [ ] Confidence scoring
  - [ ] MRZ parsing
- [ ] Implement PII encryption
  - [ ] AES-256-GCM encryption
  - [ ] Per-tenant data keys
  - [ ] Key management system
- [ ] Create redaction service
  - [ ] Identify sensitive regions
  - [ ] Generate redaction JSON
  - [ ] Apply blur/masking for previews

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

### 7. Frontend Foundation (Next.js + shadcn/ui)
- [ ] Setup Next.js 14 with TypeScript
- [ ] Install and configure shadcn/ui
- [ ] Setup Clerk provider
- [ ] Configure TanStack Query
- [ ] Implement Zod schemas
- [ ] Create layout structure
  - [ ] Navigation component
  - [ ] Company selector
  - [ ] User menu
- [ ] Build landing page with data capture
  - [ ] Company details form
  - [ ] Activity selection
  - [ ] Contact information
  - [ ] Session storage integration

### 8. Core Frontend Screens
- [ ] Dashboard
  - [ ] Company overview cards
  - [ ] Progress visualization
  - [ ] Deadline tracker
  - [ ] Quick actions
- [ ] Formation Stepper
  - [ ] YAML-driven form generation
  - [ ] Dynamic field rendering
  - [ ] Validation display
  - [ ] Progress indicator
- [ ] Documents Module
  - [ ] Upload interface with drag-drop
  - [ ] Document list with status
  - [ ] OCR results viewer
  - [ ] Field verification UI
- [ ] My Business
  - [ ] License display
  - [ ] Company details
  - [ ] Activity codes
  - [ ] Shareholder cap table

## Phase 2: Automation & Payments (Weeks 5-8)

### 9. Playwright Automation Framework
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

### 10. Stripe Integration
- [ ] Configure Stripe account (sandbox mode)
- [ ] Create product catalog
  - [ ] Formation products (IFZA, DIFC)
  - [ ] Tax registration products
  - [ ] Accounting tier subscriptions
- [ ] Implement billing endpoints
  - [ ] POST /billing/:company_id/subscribe
  - [ ] GET /billing/:company_id
  - [ ] POST /webhooks/stripe
- [ ] Build subscription management
  - [ ] Plan selection UI
  - [ ] Tier recommendation logic
  - [ ] Upgrade/downgrade flow
- [ ] Implement one-off payments
  - [ ] Tax registration orders
  - [ ] Additional services
- [ ] Create invoice management
  - [ ] Invoice generation
  - [ ] Download functionality
  - [ ] Payment history

### 11. Tax & VAT Module
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
- [ ] Setup email provider (Postmark/Resend)
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

### 18. Performance Optimization
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
- [ ] Setup Heroku deployment
  - [ ] Configure buildpacks
  - [ ] Setup environment variables
  - [ ] Configure add-ons
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


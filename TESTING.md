# Testing Guide - Simple Setup Corporate Tax Registration Agent

## 🚀 Current Status: READY FOR TESTING

### ✅ What's Working

**Environment Setup:**
- ✅ Dedicated project environment with Ruby 3.1.4 and Node.js 18.19.0
- ✅ PostgreSQL database running on localhost:5432
- ✅ Redis cache running on localhost:6379
- ✅ Complete monorepo structure with all components

**Backend (Rails API):**
- ✅ Complete database schema with UUID primary keys
- ✅ All core models: User, Company, WorkflowInstance, WorkflowStep, Document, Person, Request, CompanyMembership
- ✅ YAML-driven workflow engine with IFZA company formation workflow (9 steps)
- ✅ Comprehensive API controllers for companies, workflows, documents
- ✅ Clerk authentication middleware and JWT verification
- ✅ Full CRUD operations with proper serialization

**Frontend (Next.js):**
- ✅ Next.js 14 with TypeScript and Tailwind CSS
- ✅ Modern app directory structure
- ✅ Responsive landing page with project status
- ✅ Font configuration (Inter, Merriweather)

**Workflow System:**
- ✅ Complete IFZA formation workflow with 9 configurable steps
- ✅ Dynamic form generation from YAML configuration
- ✅ Document upload requirements and validation
- ✅ Step progression logic with automation support
- ✅ Manual fallback for automation failures

## 🧪 How to Test

### 1. Start Development Environment

```bash
# Activate environment
source ./activate-env.sh

# Start services (or use individual commands below)
./start.sh

# OR start services individually:
cd backend && unset DATABASE_URL && bundle exec rails server -p 3001 &
cd frontend && npm run dev &
```

### 2. Verify Services

```bash
# Test all services
./test-api.sh

# Or test individually:
curl http://localhost:3001/up                    # Rails health check
curl http://localhost:3000                       # Next.js frontend
curl http://localhost:3001/api/v1/companies      # Should return 401 (auth required)
```

### 3. Test API Endpoints

**Note**: All API endpoints require authentication. For testing without Clerk setup, you can temporarily disable authentication in `ApplicationController`.

```bash
# Test Companies API
curl -X GET http://localhost:3001/api/v1/companies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test Workflow Start
curl -X POST http://localhost:3001/api/v1/companies/COMPANY_ID/workflow/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test Document Upload URL Generation
curl -X POST http://localhost:3001/api/v1/documents/upload_url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"file_name": "test.pdf", "content_type": "application/pdf"}'
```

### 4. Test Workflow System

The workflow system is fully implemented with the IFZA company formation process:

**Steps:**
1. **Company Information** (FORM) - Basic company details
2. **Shareholder & Director Info** (FORM) - People and ownership
3. **Document Upload** (DOC_UPLOAD) - Required documents
4. **Application Review** (REVIEW) - CSP team review
5. **Payment Processing** (PAYMENT) - Government and service fees
6. **IFZA Portal Submission** (AUTO) - Automated submission
7. **Status Monitoring** (AUTO) - Automated status checking
8. **License Issuance** (ISSUANCE) - Generate and deliver license
9. **Completion Notification** (NOTIFY) - Client notification

## 🔧 Development Commands

```bash
# Environment
source ./activate-env.sh              # Activate project environment
./setup-environment.sh                # One-time environment setup
./start.sh                            # Start all services
./test-api.sh                         # Test all APIs

# Backend (from /backend directory)
unset DATABASE_URL && bundle exec rails server -p 3001    # Start Rails
unset DATABASE_URL && bundle exec rails console           # Rails console
unset DATABASE_URL && bundle exec rake db:migrate         # Run migrations
unset DATABASE_URL && bundle exec rake routes             # Show routes

# Frontend (from /frontend directory)
npm run dev                           # Start Next.js
npm run build                         # Build for production
npm run type-check                    # TypeScript checking

# Database
psql -h localhost -p 5432 -U postgres simple_setup_development  # Connect to DB
```

## 🐛 Known Issues & Solutions

### Rails Server Issues
If Rails server won't start:
```bash
cd backend
unset DATABASE_URL
source ../activate-env.sh
bundle install
bundle exec rails server -p 3001
```

### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql@15

# Reset database if needed
cd backend && unset DATABASE_URL && bundle exec rake db:drop db:create db:migrate
```

### Frontend Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 What You Can Test

### 1. Database Models
- Create companies, users, workflow instances
- Test model associations and validations
- Verify UUID primary keys working

### 2. Workflow Engine
- Load IFZA workflow configuration
- Parse YAML workflow definitions
- Test step validation logic
- Verify workflow progression

### 3. API Endpoints
- Company CRUD operations
- Workflow management
- Document upload flow
- Authentication verification

### 4. Frontend
- Responsive design
- Tailwind CSS styling
- Next.js routing
- Component structure

## 🎯 Ready for Integration

The foundation is complete and ready for:
1. **Clerk Authentication** - Frontend and backend integration
2. **Document OCR Pipeline** - Google Gemini 2.5 Pro integration  
3. **Payment Processing** - Stripe integration
4. **Design System** - Custom gradients and components
5. **Mobile App** - Expo React Native implementation

## 🏆 Achievement Summary

**Phase 1 MVP Foundation: COMPLETED** ✅
- Complete monorepo architecture
- Rails API with full workflow engine
- Next.js frontend foundation
- Database schema with all relationships
- YAML-driven workflow system
- Authentication framework
- Development environment

**Ready for Phase 2:** Automation & Payments 🚀

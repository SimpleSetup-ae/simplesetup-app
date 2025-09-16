# Simple Setup Corporate Tax Registration Agent

A comprehensive UAE company formation SaaS platform with multi-app architecture, automation workflows, and AI-powered document processing.

## 🏗️ Architecture

This is a monorepo containing multiple applications:

- **`/backend`** - Ruby on Rails API server
- **`/frontend`** - Next.js web application
- **`/mobile`** - Expo React Native mobile app
- **`/automations`** - Playwright automation workers
- **`/shared`** - Common TypeScript types and schemas

## 🚀 Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd Simple-Setup-Corporate-Tax-Reg-Agent
   cp env.template .env
   # Configure your .env file
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development environment**:
   ```bash
   ./scripts/start.sh
   ```

This will start all services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Redis: localhost:6379

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **shadcn/ui** components
- **Tailwind CSS** with custom gradients
- **Clerk** authentication
- **TanStack Query** for data fetching
- **Zod** for validation

### Backend
- **Ruby on Rails 7** API-only
- **Supabase** PostgreSQL database
- **Sidekiq** background jobs
- **Redis** caching and queues
- **Clerk** JWT verification

### Mobile
- **Expo** React Native
- **TypeScript**
- **Clerk** authentication
- **React Query**

### Automations
- **Playwright** browser automation
- **AI SDK** with Claude 3.5 Sonnet
- **TypeScript**
- **Bull Queue** job management

## 📋 Features

### Phase 1 (MVP)
- [x] Monorepo structure
- [ ] Clerk authentication
- [ ] Company formation workflow
- [ ] Document upload with OCR
- [ ] YAML-driven workflow engine
- [ ] Basic dashboard and forms

### Phase 2
- [ ] Stripe payment integration
- [ ] Playwright automations
- [ ] Tax registration module
- [ ] Request management

### Phase 3
- [ ] Visa management
- [ ] Multi-company support
- [ ] Mobile app
- [ ] Advanced notifications

## 🔧 Development

### Prerequisites
- Node.js 18+
- Ruby 3.1+
- Redis
- PostgreSQL (or Supabase account)

### Branch Management
- Create feature branches: `git checkout -b feature/description`
- Never commit directly to `main`
- Use pull requests for code review
- Squash and merge when ready

### Environment Variables
Copy `env.template` to `.env` and configure:
- Supabase credentials
- Clerk authentication keys
- AI service API keys
- Stripe keys (Phase 2)

## 📚 Documentation

- [Backend API](./backend/README.md)
- [Frontend App](./frontend/README.md)
- [Mobile App](./mobile/README.md)
- [Automations](./automations/README.md)
- [Shared Types](./shared/README.md)

## 🔒 Security

- Environment variables for all secrets
- JWT token verification
- Role-based access control
- PII encryption in database
- Audit logging for sensitive operations

## 📈 Deployment

### Development
```bash
./scripts/start.sh
```

### Production
- **Backend**: Heroku with Ruby buildpack
- **Frontend**: Vercel or Netlify
- **Database**: Supabase
- **Cache**: Redis Cloud

## 🤝 Contributing

1. Follow the repository rules in `.cursorrules`
2. Complete pre-implementation audits
3. Use feature branches
4. Write tests for new features
5. Update documentation

## 📄 License

Proprietary - Simple Setup

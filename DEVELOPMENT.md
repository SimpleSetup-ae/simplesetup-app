# Development Environment Setup

This document explains how to set up and use the development environment for the Simple Setup Corporate Tax Registration Agent.

## 🚀 Quick Setup

### 1. Run the Environment Setup Script

```bash
./setup-environment.sh
```

This script will:
- Install Homebrew (if not present)
- Install rbenv for Ruby version management
- Install nvm for Node.js version management
- Install Ruby 3.1.4
- Install Node.js 18.19.0
- Install PostgreSQL, Redis, and other system dependencies
- Install Rails, Bundler, and global npm packages
- Start PostgreSQL and Redis services
- Create `.env` file from template
- Install project dependencies

### 2. Configure Environment Variables

Edit the `.env` file with your actual API keys and credentials:

```bash
# Copy the template and edit
cp env.template .env
# Edit with your favorite editor
code .env  # or vim .env, nano .env, etc.
```

### 3. Start Development Services

```bash
./scripts/start.sh
```

This will start all development services:
- Frontend (Next.js): http://localhost:3000
- Backend (Rails): http://localhost:3001
- Redis: localhost:6379
- PostgreSQL: localhost:5432

## 🔧 Manual Environment Activation

If you need to activate the project environment in a new terminal session:

```bash
source ./activate-env.sh
```

This will:
- Activate the correct Ruby version (3.1.4)
- Activate the correct Node.js version (18.19.0)
- Load environment variables from `.env`
- Set up project-specific PATH variables

## 📋 Version Requirements

- **Ruby**: 3.1.4 (managed by rbenv)
- **Node.js**: 18.19.0 (managed by nvm)
- **Rails**: 7.1.x
- **PostgreSQL**: 15.x
- **Redis**: 7.x

## 🛠️ Development Tools

### Ruby/Rails Tools
- `rbenv` - Ruby version management
- `bundle` - Gem dependency management
- `rails` - Rails CLI
- `sidekiq` - Background job processing

### Node.js Tools
- `nvm` - Node.js version management
- `npm` - Package management
- `npx` - Package execution
- `expo` - React Native development

### System Dependencies
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queues
- **ImageMagick** - Image processing for OCR
- **libvips** - Fast image processing

## 🗂️ Project Structure

```
Simple-Setup-Corporate-Tax-Reg-Agent/
├── backend/           # Rails API
├── frontend/          # Next.js web app
├── mobile/            # Expo React Native app
├── automations/       # Playwright workers
├── shared/            # Common types/schemas
├── .ruby-version      # Ruby version specification
├── .nvmrc             # Node.js version specification
├── setup-environment.sh  # Environment setup script
├── activate-env.sh    # Environment activation script
├── start.sh           # Development server startup
└── docker-compose.yml # Local services
```

## 🚨 Troubleshooting

### Ruby Issues
```bash
# Reinstall Ruby
rbenv install 3.1.4
rbenv local 3.1.4
rbenv rehash

# Reinstall gems
cd backend
bundle install
```

### Node.js Issues
```bash
# Reinstall Node.js
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0

# Reinstall packages
npm install
```

### Database Issues
```bash
# Restart PostgreSQL
brew services restart postgresql@15

# Reset database
cd backend
rails db:drop db:create db:migrate
```

### Redis Issues
```bash
# Restart Redis
brew services restart redis

# Clear Redis cache
redis-cli flushall
```

## 🔄 Daily Development Workflow

1. **Start your day**:
   ```bash
   source ./activate-env.sh
   ./scripts/start.sh
   ```

2. **Make changes** in your preferred editor

3. **Test changes**:
   ```bash
   # Backend tests
   cd backend && rails test
   
   # Frontend tests
   cd frontend && npm test
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin feature/your-branch
   ```

5. **End of day**:
   ```bash
   # Stop services with Ctrl+C in start.sh terminal
   # Or stop individual services
   brew services stop postgresql@15
   brew services stop redis
   ```

## 🔐 Security Notes

- Never commit `.env` files
- Use different API keys for development and production
- Keep your local environment updated
- Use feature branches for all development

## 🆘 Getting Help

If you encounter issues:
1. Check this documentation
2. Review error messages carefully
3. Check service logs in the start.sh terminal
4. Restart services: `./scripts/start.sh`
5. Re-run environment setup: `./setup-environment.sh`

## 📚 Additional Resources

- [Rails Guides](https://guides.rubyonrails.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Supabase Documentation](https://supabase.com/docs)
 

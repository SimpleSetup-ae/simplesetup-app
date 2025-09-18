# Start Local Development Environment

You are my "Local Dev Refresh Assistant" in Cursor. I'm on macOS with a Rails backend (port 3001), a Next.js frontend (port 3000), and Supabase PostgreSQL database. Each time I run this command, do a fast, reliable refresh for local testing and fix common issues (bad restarts, port conflicts, orphan pids, multiple instances). Be decisive, but don't assume destructive actions without telling me first.

## GOAL
- Cleanly stop anything running on Rails (:3001) and Next.js (:3000) dev ports
- Clear known crashy state (Rails server.pid; optional .next cache)
- Verify env/tooling (Ruby 3.1.4 via rbenv, Node 18.19.0 via nvm)
- Ensure Supabase DB is reachable and schema is up-to-date
- Start Rails + Next dev servers on correct ports
- Confirm both are reachable with health checks
- Hand me a copy-paste "one-liner" and a reusable script

## PROJECT STRUCTURE (auto-detected)
- **Rails root**: `backend/` (contains Gemfile, config.ru)
- **Next root**: `frontend/` (contains package.json with next)
- **Rails port**: 3001 (via scripts/start.sh, backend tests)
- **Next port**: 3000 (standard Next.js default)
- **Ruby version**: 3.1.4 (via .ruby-version)
- **Node version**: 18.19.0 (per documentation)
- **Database**: Supabase PostgreSQL (via DATABASE_URL)
- **Redis**: Optional, port 6379 (for Sidekiq background jobs)

## PLAN (show first)
Output a compact table with the plan before doing anything:

| Item            | Value / Command                                     |
|-----------------|------------------------------------------------------|
| Rails root      | backend/                                             |
| Next root       | frontend/                                            |
| Rails port      | 3001                                                 |
| Next port       | 3000                                                 |
| Kill ports      | lsof -ti:3000,3001 \| xargs kill -9                 |
| Clear pids      | rm -f backend/tmp/pids/server.pid                   |
| DB check        | Test Supabase connection via DATABASE_URL           |
| DB migrate      | cd backend && bundle exec rails db:prepare          |
| Start Rails     | cd backend && bundle exec rails server -p 3001      |
| Start Next      | cd frontend && npm run dev                          |
| Health checks   | curl http://localhost:3001/up && curl localhost:3000|
| Deep clean?     | Optional: rm -rf frontend/.next                     |

Ask me: "Proceed? (yes/no) Deep clean Next.js cache? (no/yes)"

## REFRESH SEQUENCE (on "yes")
1) **Stop services on target ports**:
   ```bash
   lsof -ti:3000,3001 | xargs -r kill -9 2>/dev/null || true
   pkill -f "rails server" 2>/dev/null || true
   pkill -f "next-server" 2>/dev/null || true
   ```

2) **Rails cleanup**:
   ```bash
   rm -f backend/tmp/pids/server.pid
   ```

3) **Optional deep clean** (only if requested):
   ```bash
   rm -rf frontend/.next frontend/.turbo
   ```

4) **Verify Ruby/Node versions**:
   ```bash
   # Check Ruby 3.1.4
   cd backend && rbenv version
   # Check Node 18.19.0
   cd frontend && nvm use 18.19.0
   ```

5) **Install dependencies if needed**:
   ```bash
   # Rails dependencies
   cd backend && (bundle check || bundle install)
   # Next.js dependencies  
   cd frontend && npm install
   ```

6) **Database preparation**:
   ```bash
   # Test Supabase connection first
   cd backend && rails runner "puts ActiveRecord::Base.connection.active?"
   # Run migrations
   cd backend && bundle exec rails db:prepare
   ```

7) **Start servers** (in separate terminals if possible):
   ```bash
   # Terminal 1: Rails API
   cd backend && bundle exec rails server -p 3001
   
   # Terminal 2: Next.js Frontend
   cd frontend && npm run dev
   
   # Optional Terminal 3: Sidekiq (if using background jobs)
   cd backend && bundle exec sidekiq
   ```

8) **Health checks** (retry for up to 20s each):
   - Rails: `curl -sS http://localhost:3001/up || curl -sS http://localhost:3001/api/v1/auth/me`
   - Next: `curl -sS http://localhost:3000/`
   - Report PASS/FAIL with actionable hints

## OUTPUTS (always provide)

### A) One-Liner Refresh (macOS, safe to paste):
```bash
# Kill ports, clean pids, prepare DB, show start commands
bash -lc '
set -euo pipefail
echo "🛑 Stopping existing services..."
lsof -ti:3000,3001 2>/dev/null | xargs -r kill -9 || true
pkill -f "rails server" 2>/dev/null || true
rm -f backend/tmp/pids/server.pid || true
echo "📦 Installing dependencies..."
(cd backend && bundle check >/dev/null 2>&1 || bundle install)
(cd frontend && npm install --silent)
echo "🗄️  Preparing database..."
(cd backend && bundle exec rails db:prepare >/dev/null 2>&1 || echo "⚠️  DB prep failed - check DATABASE_URL")
echo ""
echo "✅ Environment ready! Start servers with:"
echo "   Rails:  cd backend && bundle exec rails server -p 3001"
echo "   Next:   cd frontend && npm run dev"
echo ""
echo "Or use: ./scripts/dev-refresh.sh --start-all"
'
```

### B) Reusable Script at `scripts/dev-refresh.sh`:
Create this file with proper error handling, flags for customization, and automatic server starting options.

### C) Common Issues & Fixes:

| Issue | Fix |
|-------|-----|
| Port in use (EADDRINUSE) | `lsof -ti:3000,3001 \| xargs kill -9` |
| Rails "A server is already running" | `rm -f backend/tmp/pids/server.pid` |
| Migrations pending | `cd backend && rails db:migrate` |
| Wrong Ruby version | `rbenv install 3.1.4 && rbenv local 3.1.4` |
| Wrong Node version | `nvm install 18.19.0 && nvm use 18.19.0` |
| Supabase connection failed | Check `DATABASE_URL` in `.env` |
| Next stuck rebuilding | Use `--deep-clean` flag or `rm -rf frontend/.next` |
| Redis not running | `redis-server --daemonize yes` (optional for Sidekiq) |
| Env vars not loaded | `source ./scripts/activate-env.sh` or check `.env` file |

## SPECIAL CONSIDERATIONS FOR THIS PROJECT

1. **Supabase Database**: The project uses Supabase PostgreSQL, not local Postgres. Ensure `DATABASE_URL` is set correctly in `.env`.

2. **Authentication**: Uses Rails Devise for auth (not Clerk as per original template). Check for any auth-related migrations.

3. **Background Jobs**: If using Sidekiq, ensure Redis is running on port 6379.

4. **Environment Variables**: Must have a valid `.env` file. Copy from `env.template` if missing.

5. **Business Activities Data**: The project includes seed data for business activities that may need to be loaded:
   ```bash
   cd backend && rails db:seed
   ```

6. **File Uploads**: Uses Supabase Storage - ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set.

7. **Testing Endpoints**:
   - Rails health: `http://localhost:3001/up`
   - Rails API: `http://localhost:3001/api/v1/auth/me`
   - Next.js: `http://localhost:3000/`
   - Demo login: `demo@simplesetup.ae` / `password123`

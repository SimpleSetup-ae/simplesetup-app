# Start Local Development Environment

You are my "Local Dev Refresh Assistant" in Cursor. I'm on macOS with a Rails backend (port 3001), a Next.js frontend (port 3000), and Supabase PostgreSQL database. Each time I run this command, do a fast, reliable refresh for local testing and fix common issues (bad restarts, port conflicts, orphan pids, multiple instances). Be decisive, but don't assume destructive actions without telling me first.

## GOAL
- Cleanly stop anything running on Rails (:3001) and Next.js (:3000) dev ports
- Clear known crashy state (Rails server.pid; optional .next cache)
- Verify env/tooling (Ruby 3.1.4 via rbenv, Node 18.19.0 via nvm)
- Ensure Supabase DB is reachable and schema is up-to-date
- Start Rails + Next dev servers on correct ports
- Confirm both are reachable with health checks
- **USE EXISTING `scripts/dev-refresh.sh` SCRIPT** (don't recreate it)

## PROJECT STRUCTURE (auto-detected)
- **Rails root**: `backend/` (contains Gemfile, config.ru)
- **Next root**: `frontend/` (contains package.json with next)
- **Rails port**: 3001 (via scripts/start.sh, backend tests)
- **Next port**: 3000 (standard Next.js default)
- **Ruby version**: 3.1.4 (via .ruby-version)
- **Node version**: 18.19.0 (per documentation)
- **Database**: Supabase PostgreSQL (via DATABASE_URL)
- **Redis**: Optional, port 6379 (for Sidekiq background jobs)
- **Dev Refresh Script**: `scripts/dev-refresh.sh` (reusable script with options)

## FIRST ACTION: CHECK FOR EXISTING SCRIPT

**ALWAYS CHECK FIRST** if `scripts/dev-refresh.sh` exists:
- If it exists → USE IT (don't recreate)
- If missing → Create it ONCE

## QUICK START OPTIONS

### Option 1: Use Existing Script (PREFERRED)
If `scripts/dev-refresh.sh` exists, offer these quick commands:

```bash
# Basic refresh (stop services, clean up, prepare environment)
./scripts/dev-refresh.sh

# Refresh and auto-start both servers
./scripts/dev-refresh.sh --start-all

# Deep clean (removes .next cache) and refresh
./scripts/dev-refresh.sh --deep-clean

# Deep clean and auto-start
./scripts/dev-refresh.sh --deep-clean --start-all

# See all options
./scripts/dev-refresh.sh --help
```

### Option 2: Manual Quick Command
If user prefers a one-liner or script is missing:

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
'
```

## PLAN (show first)
Output a compact status check before doing anything:

| Check                | Status                                              |
|---------------------|-----------------------------------------------------|
| Script exists?      | ✅ scripts/dev-refresh.sh found / ❌ Missing       |
| Ports in use?       | Check 3000, 3001                                   |
| Rails PID exists?   | Check backend/tmp/pids/server.pid                  |
| Dependencies OK?    | Bundle check, npm list                             |
| Database reachable? | Test Supabase connection                           |

Then ask: 
- If script exists: "Run `./scripts/dev-refresh.sh --start-all`? (yes/no) Or use different options?"
- If script missing: "Create the script first? (yes/no)"

## COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| Port in use (EADDRINUSE) | `lsof -ti:3000,3001 \| xargs kill -9` |
| Rails "A server is already running" | `rm -f backend/tmp/pids/server.pid` |
| Migrations pending | `cd backend && rails db:migrate` |
| Wrong Ruby version | `rbenv install 3.1.4 && rbenv local 3.1.4` |
| Wrong Node version | `nvm install 18.19.0 && nvm use 18.19.0` |
| Supabase connection failed | Check `DATABASE_URL` in `.env` |
| Next stuck rebuilding | `rm -rf frontend/.next` or use `--deep-clean` flag |
| Redis not running | `redis-server --daemonize yes` (optional for Sidekiq) |
| Env vars not loaded | Check `.env` file exists |

## TESTING ENDPOINTS
After servers are running:
- Rails health: `http://localhost:3001/up`
- Rails API: `http://localhost:3001/api/v1/auth/me`
- Next.js: `http://localhost:3000/`
- Demo login: `demo@simplesetup.ae` / `password123`

## HELPFUL COMMANDS
- View Rails logs: `tail -f backend/log/development.log`
- Rails console: `cd backend && rails console`
- Database console: `cd backend && rails dbconsole`
- Run specific migration: `cd backend && rails db:migrate:up VERSION=<timestamp>`
- Rollback migration: `cd backend && rails db:rollback`
- Load seed data: `cd backend && rails db:seed`

## SCRIPT CREATION (ONLY IF MISSING)
Only create `scripts/dev-refresh.sh` if it doesn't exist. The script should include:
- Options: `--deep-clean`, `--start-all`, `--skip-deps`, `--verbose`, `--help`
- Port cleanup and PID management
- Ruby/Node version verification
- Dependency installation
- Database preparation
- Optional server auto-start
- Health checks
- Colored output for better readability

## KEY PRINCIPLE
**DON'T RECREATE WHAT ALREADY EXISTS** - Always check for and use existing `scripts/dev-refresh.sh` first. Only create it if missing. This saves time and preserves any custom modifications.

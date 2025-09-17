#!/bin/bash
# Development Environment Refresh Script
# Usage: ./scripts/dev-refresh.sh [--deep-clean] [--start-all]

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAILS_PORT=3001
NEXT_PORT=3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Parse arguments
DEEP_CLEAN=false
START_ALL=false

for arg in "$@"; do
    case $arg in
        --deep-clean)
            DEEP_CLEAN=true
            shift
            ;;
        --start-all)
            START_ALL=true
            shift
            ;;
        *)
            echo "Usage: $0 [--deep-clean] [--start-all]"
            exit 1
            ;;
    esac
done

cd "$PROJECT_ROOT"

log "🛑 Stopping existing services..."
# Kill processes on target ports
lsof -ti:$NEXT_PORT,$RAILS_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "rails server" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

log "🧹 Cleaning state files..."
rm -f backend/tmp/pids/server.pid
rm -f backend/tmp/pids/sidekiq.pid

if [ "$DEEP_CLEAN" = true ]; then
    log "🗑️  Deep cleaning caches..."
    rm -rf frontend/.next
    rm -rf frontend/.turbo
    rm -rf backend/tmp/cache
fi

log "📦 Installing dependencies..."
(cd backend && bundle check >/dev/null 2>&1 || bundle install)
(cd frontend && npm install --silent)

log "🗄️  Preparing database..."
(cd backend && bundle exec rails db:prepare >/dev/null 2>&1) || warning "DB prep failed - check DATABASE_URL"

success "Environment ready!"

if [ "$START_ALL" = true ]; then
    log "🚀 Starting servers..."
    
    # Start Rails in daemon mode
    (cd backend && bundle exec rails server -p $RAILS_PORT -d)
    success "Rails server started on port $RAILS_PORT"
    
    # Start Next.js in background
    (cd frontend && npm run dev > /dev/null 2>&1 &)
    success "Next.js server starting on port $NEXT_PORT"
    
    # Wait a moment for servers to start
    sleep 3
    
    # Health checks
    log "🔍 Health checks..."
    if curl -s -f http://localhost:$RAILS_PORT/api/v1/auth/me >/dev/null 2>&1; then
        success "Rails API responding"
    else
        warning "Rails API not responding yet"
    fi
    
    if curl -s -f http://localhost:$NEXT_PORT/ >/dev/null 2>&1; then
        success "Next.js responding"
    else
        warning "Next.js not responding yet"
    fi
    
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:$NEXT_PORT"
    echo "   Backend:  http://localhost:$RAILS_PORT/api/v1"
    echo ""
else
    echo ""
    echo "✅ Environment ready! Start servers manually:"
    echo "   Rails:  cd backend && bundle exec rails server -p $RAILS_PORT"
    echo "   Next:   cd frontend && npm run dev"
    echo ""
    echo "Or run with --start-all flag to start automatically"
fi

# Show running processes
echo "📊 Running processes:"
ps aux | grep -E "(puma|next)" | grep -v grep || echo "   No servers running"
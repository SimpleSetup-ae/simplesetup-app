#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DEEP_CLEAN=false
START_ALL=false
SKIP_DEPS=false
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --deep-clean)
            DEEP_CLEAN=true
            shift
            ;;
        --start-all)
            START_ALL=true
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --deep-clean    Remove .next cache and other build artifacts"
            echo "  --start-all     Start Rails and Next.js servers after refresh"
            echo "  --skip-deps     Skip dependency installation"
            echo "  --verbose       Show detailed output"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Basic refresh"
            echo "  $0 --start-all        # Refresh and start servers"
            echo "  $0 --deep-clean       # Deep clean and refresh"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Project paths
PROJECT_ROOT="/Users/james/Simple-Setup-Corporate-Tax-Reg-Agent"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${GREEN}🚀 Simple Setup Development Environment Refresh${NC}"
echo ""

# Step 1: Stop existing services
echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
lsof -ti:3000,3001 2>/dev/null | xargs -r kill -9 2>/dev/null || true
pkill -f "rails server" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
echo "   ✓ Ports 3000 and 3001 cleared"

# Step 2: Clean up PID files
echo -e "${YELLOW}🧹 Cleaning up PID files...${NC}"
rm -f "$BACKEND_DIR/tmp/pids/server.pid" 2>/dev/null || true
echo "   ✓ Rails server.pid removed"

# Step 3: Deep clean if requested
if [ "$DEEP_CLEAN" = true ]; then
    echo -e "${YELLOW}🧼 Performing deep clean...${NC}"
    rm -rf "$FRONTEND_DIR/.next" 2>/dev/null || true
    rm -rf "$FRONTEND_DIR/.turbo" 2>/dev/null || true
    rm -rf "$BACKEND_DIR/tmp/cache" 2>/dev/null || true
    echo "   ✓ Build caches cleared"
fi

# Step 4: Verify Ruby version
echo -e "${YELLOW}💎 Verifying Ruby version...${NC}"
cd "$BACKEND_DIR"
RUBY_VERSION=$(rbenv version | cut -d' ' -f1)
if [[ "$RUBY_VERSION" != "3.1.4" ]]; then
    echo -e "   ${RED}✗ Wrong Ruby version: $RUBY_VERSION${NC}"
    echo "   Installing Ruby 3.1.4..."
    rbenv install 3.1.4
    rbenv local 3.1.4
else
    echo "   ✓ Ruby $RUBY_VERSION"
fi

# Step 5: Verify Node version
echo -e "${YELLOW}📦 Verifying Node version...${NC}"
cd "$FRONTEND_DIR"
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" != "v18.19.0" ]]; then
    echo -e "   ${YELLOW}⚠ Node version is $NODE_VERSION (expected v18.19.0)${NC}"
    if command -v nvm &> /dev/null; then
        echo "   Switching to Node 18.19.0..."
        nvm use 18.19.0 2>/dev/null || nvm install 18.19.0
    fi
else
    echo "   ✓ Node $NODE_VERSION"
fi

# Step 6: Install dependencies (unless skipped)
if [ "$SKIP_DEPS" = false ]; then
    echo -e "${YELLOW}📚 Installing dependencies...${NC}"
    
    # Rails dependencies
    cd "$BACKEND_DIR"
    if bundle check >/dev/null 2>&1; then
        echo "   ✓ Rails dependencies up to date"
    else
        echo "   Installing Rails gems..."
        bundle install
    fi
    
    # Next.js dependencies
    cd "$FRONTEND_DIR"
    if [ "$VERBOSE" = true ]; then
        npm install
    else
        npm install --silent
    fi
    echo "   ✓ Node modules installed"
fi

# Step 7: Database preparation
echo -e "${YELLOW}🗄️  Preparing database...${NC}"
cd "$BACKEND_DIR"

# Test connection first
if rails runner "ActiveRecord::Base.connection.active?" >/dev/null 2>&1; then
    echo "   ✓ Database connection successful"
    
    # Run migrations
    if bundle exec rails db:prepare >/dev/null 2>&1; then
        echo "   ✓ Database prepared and migrations applied"
    else
        echo -e "   ${YELLOW}⚠ Database preparation had warnings (this is usually OK)${NC}"
    fi
else
    echo -e "   ${RED}✗ Database connection failed${NC}"
    echo "   Please check your DATABASE_URL in .env file"
fi

# Step 8: Start servers if requested
if [ "$START_ALL" = true ]; then
    echo ""
    echo -e "${GREEN}🚀 Starting development servers...${NC}"
    
    # Start Rails in background
    echo "   Starting Rails API on port 3001..."
    cd "$BACKEND_DIR"
    bundle exec rails server -p 3001 -d >/dev/null 2>&1
    
    # Start Next.js in background
    echo "   Starting Next.js on port 3000..."
    cd "$FRONTEND_DIR"
    npm run dev >/dev/null 2>&1 &
    
    # Wait for servers to start
    echo -e "${YELLOW}   Waiting for servers to start...${NC}"
    sleep 5
    
    # Health checks
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    # Rails health check
    if curl -sS -f http://localhost:3001/up >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Rails API is running on http://localhost:3001${NC}"
    else
        echo -e "   ${RED}✗ Rails API is not responding${NC}"
    fi
    
    # Next.js health check
    if curl -sS -f http://localhost:3000/ >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Next.js is running on http://localhost:3000${NC}"
    else
        echo -e "   ${RED}✗ Next.js is not responding${NC}"
    fi
    
else
    # Just show the start commands
    echo ""
    echo -e "${GREEN}✅ Environment ready! Start servers with:${NC}"
    echo ""
    echo "   Rails API:"
    echo -e "   ${YELLOW}cd $BACKEND_DIR && bundle exec rails server -p 3001${NC}"
    echo ""
    echo "   Next.js Frontend:"
    echo -e "   ${YELLOW}cd $FRONTEND_DIR && npm run dev${NC}"
    echo ""
    echo "   Or run this script with --start-all to start both automatically:"
    echo -e "   ${YELLOW}$0 --start-all${NC}"
fi

# Optional: Show additional helpful commands
echo ""
echo -e "${GREEN}📝 Helpful commands:${NC}"
echo "   View Rails logs:     tail -f $BACKEND_DIR/log/development.log"
echo "   Rails console:       cd $BACKEND_DIR && rails console"
echo "   Test endpoints:      curl http://localhost:3001/api/v1/auth/me"
echo "   Sidekiq (optional):  cd $BACKEND_DIR && bundle exec sidekiq"
echo ""

# Show common issues if servers aren't running
if [ "$START_ALL" = false ]; then
    echo -e "${YELLOW}💡 Quick troubleshooting:${NC}"
    echo "   Port in use:         lsof -ti:3000,3001 | xargs kill -9"
    echo "   Deep clean:          $0 --deep-clean"
    echo "   Check env vars:      cat $PROJECT_ROOT/.env | grep -E 'DATABASE_URL|SUPABASE'"
fi
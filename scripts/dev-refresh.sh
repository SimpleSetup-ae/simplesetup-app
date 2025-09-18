#!/bin/bash

# Simple Setup - Local Dev Refresh Script
# Cleanly stops and restarts Rails (3001) and Next.js (3000) development servers

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
BACKEND_DIR="/Users/james/Simple-Setup-Corporate-Tax-Reg-Agent/backend"
FRONTEND_DIR="/Users/james/Simple-Setup-Corporate-Tax-Reg-Agent/frontend"
PROJECT_ROOT="/Users/james/Simple-Setup-Corporate-Tax-Reg-Agent"

# Flags
DEEP_CLEAN=false
START_ALL=false
SKIP_DEPS=false

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
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --deep-clean    Remove Next.js cache (.next directory)"
            echo "  --start-all     Automatically start both servers after cleanup"
            echo "  --skip-deps     Skip dependency installation checks"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🚀 Simple Setup - Local Dev Refresh${NC}"
echo "================================================"

# 1. Stop existing services
echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
lsof -ti:3000,3001 2>/dev/null | xargs -r kill -9 2>/dev/null || true
pkill -f "rails server" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
rm -f "$BACKEND_DIR/tmp/pids/server.pid" 2>/dev/null || true
echo -e "${GREEN}✅ Services stopped${NC}"

# 2. Optional deep clean
if [ "$DEEP_CLEAN" = true ]; then
    echo -e "${YELLOW}🧹 Deep cleaning Next.js cache...${NC}"
    rm -rf "$FRONTEND_DIR/.next" "$FRONTEND_DIR/.turbo" 2>/dev/null || true
    echo -e "${GREEN}✅ Cache cleaned${NC}"
fi

# 3. Verify Ruby/Node versions
echo -e "${YELLOW}📦 Verifying tooling versions...${NC}"
cd "$BACKEND_DIR"
RUBY_VERSION=$(rbenv version | cut -d' ' -f1)
echo "Ruby: $RUBY_VERSION"

cd "$FRONTEND_DIR"
NODE_VERSION=$(node --version)
echo "Node: $NODE_VERSION"

# 4. Install dependencies (unless skipped)
if [ "$SKIP_DEPS" = false ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    cd "$BACKEND_DIR"
    if ! bundle check >/dev/null 2>&1; then
        echo "Installing Rails gems..."
        bundle install --quiet
    fi
    
    cd "$FRONTEND_DIR"
    echo "Installing npm packages..."
    npm install --silent
    
    echo -e "${GREEN}✅ Dependencies ready${NC}"
fi

# 5. Test database connection
echo -e "${YELLOW}🗄️ Testing Supabase connection...${NC}"
cd "$BACKEND_DIR"
if timeout 10 rails runner "puts ActiveRecord::Base.connection.active?" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connected${NC}"
else
    echo -e "${RED}⚠️ Database connection failed - check DATABASE_URL in .env${NC}"
fi

# 6. Run database preparation
echo -e "${YELLOW}🗄️ Preparing database...${NC}"
cd "$BACKEND_DIR"
if bundle exec rails db:prepare >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database prepared${NC}"
else
    echo -e "${RED}⚠️ Database preparation failed${NC}"
fi

# 7. Verify ports are clear
echo -e "${YELLOW}🔍 Verifying ports are clear...${NC}"
if lsof -ti:3000,3001 >/dev/null 2>&1; then
    echo -e "${RED}⚠️ Ports still in use after cleanup${NC}"
else
    echo -e "${GREEN}✅ Ports 3000,3001 are clear${NC}"
fi

echo ""
echo -e "${GREEN}✅ Environment refresh complete!${NC}"
echo ""

# 8. Start servers if requested
if [ "$START_ALL" = true ]; then
    echo -e "${BLUE}🚀 Starting servers...${NC}"
    
    # Start Rails in background
    cd "$BACKEND_DIR"
    echo "Starting Rails server on port 3001..."
    bundle exec rails server -p 3001 &
    RAILS_PID=$!
    
    # Start Next.js in background
    cd "$FRONTEND_DIR"
    echo "Starting Next.js server on port 3000..."
    npm run dev &
    NEXT_PID=$!
    
    # Wait for servers to start
    sleep 5
    
    # Health checks
    echo -e "${YELLOW}🔍 Running health checks...${NC}"
    
    if curl -sS --max-time 5 http://localhost:3001/up >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Rails server (3001) - HEALTHY${NC}"
    else
        echo -e "${RED}❌ Rails server (3001) - FAILED${NC}"
    fi
    
    if curl -sS --max-time 5 http://localhost:3000/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Next.js server (3000) - HEALTHY${NC}"
    else
        echo -e "${RED}❌ Next.js server (3000) - FAILED${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Both servers are running!${NC}"
    echo -e "Rails API: ${BLUE}http://localhost:3001${NC}"
    echo -e "Next.js Frontend: ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo "To stop servers: kill $RAILS_PID $NEXT_PID"
    
else
    echo -e "${BLUE}📋 Manual start commands:${NC}"
    echo ""
    echo "Rails server (Terminal 1):"
    echo "  cd $BACKEND_DIR && bundle exec rails server -p 3001"
    echo ""
    echo "Next.js server (Terminal 2):"
    echo "  cd $FRONTEND_DIR && npm run dev"
    echo ""
    echo "Or run with auto-start: $0 --start-all"
fi

echo ""
echo -e "${BLUE}📊 Quick reference:${NC}"
echo "• Rails health: http://localhost:3001/up"
echo "• Next.js: http://localhost:3000/"
echo "• Kill ports: lsof -ti:3000,3001 | xargs kill -9"
echo "• Deep clean: $0 --deep-clean"
echo "• Full restart: $0 --start-all"
#!/bin/bash

# UAE Company Formation SaaS - Local Development Startup Script

set -e

echo "🚀 Starting Simple Setup Corporate Tax Registration Agent..."

# Resolve repository root and ensure consistent working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/.."
cd "$REPO_ROOT"

# Activate project environment
echo "🔧 Activating project environment..."
source "$REPO_ROOT/scripts/activate-env.sh"

# Check if .env exists (do not create or copy placeholders)
if [ ! -f "$REPO_ROOT/.env" ]; then
    echo "❌ .env file not found in project root. Please create it with actual values. Aborting."
    exit 1
fi

# Function to check if a service is running
check_service() {
    local service=$1
    local port=$2
    if lsof -i :$port >/dev/null 2>&1; then
        echo "✅ $service is already running on port $port"
        return 0
    else
        echo "❌ $service is not running on port $port"
        return 1
    fi
}

# Start services in background
echo "🔧 Starting development services..."

# Start Supabase local (if not using cloud)
if [ "$SUPABASE_URL" == "http://localhost:54321" ]; then
    echo "📦 Starting Supabase local..."
    if command -v supabase >/dev/null 2>&1; then
        supabase start &
    else
        echo "⚠️  Supabase CLI not found. Please install it or use cloud Supabase."
    fi
fi

# Start Redis
echo "🔴 Starting Redis..."
if command -v redis-server >/dev/null 2>&1; then
    redis-server --daemonize yes --port 6379
else
    echo "⚠️  Redis not found. Please install Redis."
fi

# Install dependencies if needed
echo "📦 Installing root dependencies..."
if [ -f "$REPO_ROOT/package.json" ] && [ ! -d "$REPO_ROOT/node_modules" ]; then
    npm install
fi

# Backend setup
echo "🛠️  Setting up Rails backend..."
pushd "$REPO_ROOT/backend" >/dev/null
if [ ! -f "Gemfile" ]; then
    echo "⚠️  Backend not initialized yet. Skipping Rails setup."
else
    bundle install
    rails db:create db:migrate
    # Start Rails server in background
    rails server -p ${RAILS_PORT:-3001} &
    RAILS_PID=$!
fi
popd >/dev/null

# Frontend setup
echo "🌐 Setting up Next.js frontend..."
pushd "$REPO_ROOT/frontend" >/dev/null
if [ ! -f "package.json" ]; then
    echo "⚠️  Frontend not initialized yet. Skipping Next.js setup."
else
    npm install
    # Start Next.js in background
    npm run dev &
    NEXTJS_PID=$!
fi
popd >/dev/null

# Start Sidekiq workers (when backend is ready)
if [ -f "$REPO_ROOT/backend/Gemfile" ]; then
    echo "⚙️  Starting Sidekiq workers..."
    pushd "$REPO_ROOT/backend" >/dev/null
    bundle exec sidekiq &
    SIDEKIQ_PID=$!
    popd >/dev/null
fi

echo ""
echo "🎉 Development environment started!"
echo ""
echo "📱 Services:"
echo "   Frontend (Next.js): http://localhost:3000"
echo "   Backend (Rails):     http://localhost:${RAILS_PORT:-3001}"
echo "   Redis:               localhost:6379"
echo "   Supabase:            ${SUPABASE_URL}"
echo ""
echo "🔧 To stop all services, press Ctrl+C"
echo ""

# Wait for interrupt
trap 'echo "🛑 Stopping services..."; kill $RAILS_PID $NEXTJS_PID $SIDEKIQ_PID 2>/dev/null; exit' INT
wait

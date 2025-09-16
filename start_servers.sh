#!/bin/bash

# Simple server startup script that works around environment issues

echo "🚀 Starting Simple Setup servers..."

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "rails server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "puma" 2>/dev/null || true

# Load environment
echo "🔧 Loading environment..."
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found"
    exit 1
fi

# Start Rails server using Ruby directly
echo "🛠️  Starting Rails backend on port 3001..."
cd backend
~/.rbenv/versions/3.1.4/bin/ruby -I. -r bundler/setup -r ./config/environment -e "
require 'rails/commands'
Rails::Server.new(Port: 3001, environment: 'development').start
" &
RAILS_PID=$!
echo "Rails PID: $RAILS_PID"
cd ..

# Wait a moment for Rails to start
sleep 5

# Start Next.js frontend
echo "🌐 Starting Next.js frontend on port 3000..."
cd frontend
npm run dev &
NEXTJS_PID=$!
echo "Next.js PID: $NEXTJS_PID"
cd ..

echo ""
echo "🎉 Servers started!"
echo "📱 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Sign In:  http://localhost:3000/sign-in"
echo ""
echo "🎯 Demo account:"
echo "   Email:    demo@simplesetup.ae"
echo "   Password: password123"
echo ""
echo "🔧 To stop servers: Ctrl+C"

# Wait for interrupt
trap 'echo "🛑 Stopping servers..."; kill $RAILS_PID $NEXTJS_PID 2>/dev/null; exit' INT
wait

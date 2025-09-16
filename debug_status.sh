#!/bin/bash

echo "🔍 Simple Setup - Debug Status Check"
echo "====================================="

# Check processes
echo "📊 Running Processes:"
lsof -i :3000 2>/dev/null && echo "✅ Port 3000: In use" || echo "❌ Port 3000: Free"
lsof -i :3001 2>/dev/null && echo "✅ Port 3001: In use" || echo "❌ Port 3001: Free"
lsof -i :3002 2>/dev/null && echo "✅ Port 3002: In use" || echo "❌ Port 3002: Free"

echo ""
echo "🌐 Frontend Test:"
curl -s http://localhost:3000/sign-in | grep -q "Sign In" && echo "✅ Frontend sign-in page loads" || echo "❌ Frontend sign-in page not accessible"

echo ""
echo "🛠️  Backend Test:"
curl -s http://localhost:3001/up >/dev/null 2>&1 && echo "✅ Backend health check responds" || echo "❌ Backend not responding"

echo ""
echo "🗄️  Database Test:"
if [ -f .env ]; then
    source .env
    psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;" 2>/dev/null && echo "✅ Database accessible" || echo "❌ Database not accessible"
else
    echo "❌ .env file not found"
fi

echo ""
echo "📧 Email Configuration:"
grep -q "SENDGRID_API_KEY" .env 2>/dev/null && echo "✅ SendGrid API key configured" || echo "❌ SendGrid not configured"
grep -q "DEVISE_SECRET_KEY" .env 2>/dev/null && echo "✅ Devise secret key configured" || echo "❌ Devise secret not configured"

echo ""
echo "🎯 Demo User Status:"
if [ -f .env ]; then
    source .env
    psql "$DATABASE_URL" -c "SELECT email, confirmed_at IS NOT NULL as confirmed FROM users WHERE email='demo@simplesetup.ae';" 2>/dev/null || echo "❌ Cannot check demo user"
else
    echo "❌ Cannot check demo user - no .env"
fi

echo ""
echo "📋 Summary:"
echo "   Frontend URL: http://localhost:3000/sign-in"
echo "   Backend URL:  http://localhost:3001"
echo "   Demo Account: demo@simplesetup.ae / password123"

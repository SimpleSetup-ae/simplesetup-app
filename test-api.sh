#!/bin/bash

# Simple Setup Corporate Tax Registration Agent - API Testing Script

echo "🧪 Testing Simple Setup Corporate Tax Registration Agent APIs..."
echo ""

# Test frontend
echo "🌐 Testing Frontend (Next.js)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding at http://localhost:3000"
fi

echo ""

# Test backend health
echo "🛠️  Testing Backend (Rails API)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/up | grep -q "200"; then
    echo "✅ Backend is running at http://localhost:3001"
    
    # Test API endpoints
    echo ""
    echo "🔍 Testing API Endpoints..."
    
    # Test companies endpoint (should return 401 without auth)
    echo -n "   Companies API: "
    response=$(curl -s -w "%{http_code}" http://localhost:3001/api/v1/companies)
    http_code="${response: -3}"
    if [ "$http_code" = "401" ]; then
        echo "✅ Returns 401 (authentication required) - working correctly"
    else
        echo "⚠️  Returns $http_code - check authentication middleware"
    fi
    
    # Test auth verification endpoint
    echo -n "   Auth Verify API: "
    response=$(curl -s -w "%{http_code}" http://localhost:3001/api/v1/auth/sessions/verify)
    http_code="${response: -3}"
    if [ "$http_code" = "401" ]; then
        echo "✅ Returns 401 (no token) - working correctly"
    else
        echo "⚠️  Returns $http_code"
    fi
    
else
    echo "❌ Backend is not responding at http://localhost:3001"
    echo "   Try running: cd backend && unset DATABASE_URL && bundle exec rails server -p 3001"
fi

echo ""

# Test database
echo "🗄️  Testing Database Connection..."
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "✅ PostgreSQL is running at localhost:5432"
else
    echo "❌ PostgreSQL is not running"
    echo "   Try running: brew services start postgresql@15"
fi

echo ""

# Test Redis
echo "🔴 Testing Redis Connection..."
if redis-cli ping >/dev/null 2>&1; then
    echo "✅ Redis is running at localhost:6379"
else
    echo "❌ Redis is not running"
    echo "   Try running: brew services start redis"
fi

echo ""
echo "🎯 Summary:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Database: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure .env file with actual API keys"
echo "   2. Set up Clerk authentication"
echo "   3. Test workflow creation and document upload"
echo "   4. Integrate frontend with backend APIs"

#!/bin/bash

# Reset and seed database script for SimpleSetup
# This script will wipe the database and reseed it with compliant data

echo "⚠️  WARNING: This will completely reset your database!"
echo "All existing data will be lost."
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
echo "🔄 Starting database reset process..."
echo ""

# Navigate to backend directory
cd /workspace/backend

# Drop the database
echo "📦 Dropping existing database..."
bundle exec rails db:drop DISABLE_DATABASE_ENVIRONMENT_CHECK=1

# Create the database
echo "🏗️  Creating new database..."
bundle exec rails db:create

# Run all migrations
echo "🚀 Running migrations..."
bundle exec rails db:migrate

# Seed the database
echo "🌱 Seeding database with sample data..."
bundle exec rails db:seed

echo ""
echo "✅ Database reset and seeding completed successfully!"
echo ""
echo "📊 Database Status:"
bundle exec rails runner "
  puts '  • Companies: ' + Company.count.to_s
  puts '  • Users: ' + User.count.to_s
  puts '  • Documents: ' + Document.count.to_s
  puts '  • Freezones: ' + Freezone.count.to_s
  puts '  • Business Activities: ' + BusinessActivity.count.to_s
"

echo ""
echo "🔐 Demo accounts are available:"
echo "  • Admin: admin@simplesetup.ae (password: admin123456)"
echo "  • Client: client@simplesetup.ae (password: password123)"
echo "  • Business: business@simplesetup.ae (password: password123)"
echo ""
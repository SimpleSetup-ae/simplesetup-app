#!/usr/bin/env ruby

# Create demo user for testing Devise authentication
require './backend/config/environment'

puts "🎯 Creating demo user for testing..."

# Create a simple demo user
demo_user = User.find_or_create_by(email: 'demo@simplesetup.ae') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.first_name = 'Demo'
  user.last_name = 'User'
  user.confirmed_at = Time.current # Skip email confirmation for demo
end

if demo_user.persisted?
  puts "✅ Demo user created successfully!"
  puts "   Email: demo@simplesetup.ae"
  puts "   Password: password123"
else
  puts "❌ Failed to create demo user:"
  puts "   Errors: #{demo_user.errors.full_messages.join(', ')}"
end

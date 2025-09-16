#!/usr/bin/env ruby

# Simple Rails server starter that bypasses broken rails command
require_relative 'config/environment'
require 'rack'
require 'puma'

puts "🚀 Starting Rails server on port 3001..."

# Configure Puma
server = Puma::Server.new(Rails.application)
server.add_tcp_listener('0.0.0.0', 3001)

puts "✅ Rails server running at http://localhost:3001"
puts "📋 Available endpoints:"
puts "   GET  /up - Health check"
puts "   GET  /api/v1/auth/me - Current user"
puts "   POST /api/v1/auth/sign_in - Login"
puts "   POST /users - Registration"
puts ""
puts "🎯 Demo account: demo@simplesetup.ae / password123"
puts "🔧 Press Ctrl+C to stop"

# Start server
begin
  server.run
rescue Interrupt
  puts "\n🛑 Stopping Rails server..."
  server.stop
end

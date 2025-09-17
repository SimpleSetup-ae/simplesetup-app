#!/usr/bin/env ruby

# Start Rails using Puma directly
require_relative 'config/environment'

puts "🚀 Starting Puma server on port 3001..."

# Create Puma configuration
require 'puma'
require 'puma/configuration'

app = Rails.application
port = 3001

# Configure Puma
config = Puma::Configuration.new do |c|
  c.port port
  c.environment 'development'
  c.workers 0  # Single mode
  c.threads 5, 5
end

# Create and configure server
server = Puma::Server.new(app, nil, config.options)
server.inherit_binder(Puma::Binder.new(nil, config.options))

puts "✅ Puma server starting..."
puts "📋 Available endpoints:"
puts "   GET  /up - Health check"
puts "   GET  /api/v1/auth/me - Current user"
puts "   POST /api/v1/auth/sign_in - Login"
puts "   DELETE /api/v1/auth/sign_out - Logout"
puts "   POST /users - Registration"
puts ""
puts "🎯 Demo account: demo@simplesetup.ae / password123"
puts "🌐 Server running at: http://localhost:#{port}"
puts "🔧 Press Ctrl+C to stop"

# Handle interrupts gracefully
trap('INT') do
  puts "\n🛑 Stopping Puma server..."
  server.stop(true)
  exit
end

# Start the server
server.run

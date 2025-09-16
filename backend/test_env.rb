#!/usr/bin/env ruby

# Test environment variable loading
require 'dotenv'

# Load environment from parent directory
Dotenv.load('../.env')

puts "🔍 Environment Variables Test"
puts "============================="
puts "DATABASE_URL: #{ENV['DATABASE_URL'] || 'NOT SET'}"
puts "SENDGRID_API_KEY: #{ENV['SENDGRID_API_KEY'] ? 'SET' : 'NOT SET'}"
puts "DEVISE_SECRET_KEY: #{ENV['DEVISE_SECRET_KEY'] ? 'SET' : 'NOT SET'}"
puts "RAILS_ENV: #{ENV['RAILS_ENV'] || 'NOT SET'}"

if ENV['DATABASE_URL']
  puts "\n✅ Environment variables loaded successfully!"
else
  puts "\n❌ Environment variables not loaded properly"
end

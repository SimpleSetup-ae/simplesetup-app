#!/usr/bin/env ruby

# Test SendGrid configuration
require './config/environment'

puts "🧪 Testing SendGrid Configuration"
puts "=================================="

# Check if SendGrid API key is present
if ENV['SENDGRID_API_KEY'].present?
  puts "✅ SENDGRID_API_KEY is configured"
  puts "   Key starts with: #{ENV['SENDGRID_API_KEY'][0..10]}..."
else
  puts "❌ SENDGRID_API_KEY is missing from environment"
  exit 1
end

# Check ActionMailer configuration
puts "\n📧 ActionMailer Settings:"
puts "   Delivery method: #{ActionMailer::Base.delivery_method}"
puts "   Perform deliveries: #{ActionMailer::Base.perform_deliveries}"
puts "   Raise delivery errors: #{ActionMailer::Base.raise_delivery_errors}"

if ActionMailer::Base.delivery_method == :smtp
  smtp_settings = ActionMailer::Base.smtp_settings
  puts "\n📮 SMTP Settings:"
  puts "   Address: #{smtp_settings[:address]}"
  puts "   Port: #{smtp_settings[:port]}"
  puts "   Domain: #{smtp_settings[:domain]}"
  puts "   Authentication: #{smtp_settings[:authentication]}"
  puts "   Username: #{smtp_settings[:user_name]}"
  puts "   Password configured: #{smtp_settings[:password].present? ? 'Yes' : 'No'}"
end

# Check Devise configuration
puts "\n🔐 Devise Settings:"
puts "   Mailer sender: #{Devise.mailer_sender}"
puts "   Secret key configured: #{Devise.secret_key.present? ? 'Yes' : 'No'}"

# Test email sending (optional - uncomment to actually send a test email)
puts "\n🚀 Ready to send emails!"
puts "\nTo test email sending, you can run:"
puts "   rails console"
puts "   ActionMailer::Base.mail(to: 'test@example.com', from: 'noreply@simplesetup.ae', subject: 'Test', body: 'Hello').deliver_now"

puts "\n✅ SendGrid setup appears to be configured correctly!"

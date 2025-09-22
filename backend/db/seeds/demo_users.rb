# Demo Users for Different User Types
# These accounts can be used for testing and demonstration

puts "🌱 Creating demo user accounts..."

# Demo Client - Individual Entrepreneur
client_user = User.find_or_create_by(email: 'client@simplesetup.ae') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.first_name = 'Ahmed'
  user.last_name = 'Al-Rashid'
  user.confirmed_at = Time.current # Skip email confirmation for demo
  puts "   ✅ Created client user: #{user.email}"
end

# Demo Business Owner - SME
business_owner = User.find_or_create_by(email: 'business@simplesetup.ae') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.first_name = 'Fatima'
  user.last_name = 'Al-Zahra'
  user.confirmed_at = Time.current
  puts "   ✅ Created business owner: #{user.email}"
end

# Demo Corporate Client - Large Company
corporate_user = User.find_or_create_by(email: 'corporate@simplesetup.ae') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.first_name = 'Mohammad'
  user.last_name = 'Al-Maktoum'
  user.confirmed_at = Time.current
  puts "   ✅ Created corporate user: #{user.email}"
end

# Demo Admin User
admin_user = User.find_or_create_by(email: 'admin@simplesetup.ae') do |user|
  user.password = 'admin123456'
  user.password_confirmation = 'admin123456'
  user.first_name = 'Sarah'
  user.last_name = 'Administrator'
  user.is_admin = true
  user.confirmed_at = Time.current
  puts "   ✅ Created admin user: #{user.email}"
end

# Ensure admin flag is set for existing admin user
admin_user.update!(is_admin: true) unless admin_user.is_admin?

# Demo Support User
support_user = User.find_or_create_by(email: 'support@simplesetup.ae') do |user|
  user.password = 'support123'
  user.password_confirmation = 'support123'
  user.first_name = 'Omar'
  user.last_name = 'Support'
  user.confirmed_at = Time.current
  puts "   ✅ Created support user: #{user.email}"
end

# Demo Accountant User
accountant_user = User.find_or_create_by(email: 'accountant@simplesetup.ae') do |user|
  user.password = 'accounting123'
  user.password_confirmation = 'accounting123'
  user.first_name = 'Layla'
  user.last_name = 'Al-Accountant'
  user.confirmed_at = Time.current
  puts "   ✅ Created accountant user: #{user.email}"
end

puts "\n🎯 Demo User Summary:"
puts "   📧 Client: client@simplesetup.ae (password: password123)"
puts "   🏢 Business Owner: business@simplesetup.ae (password: password123)"
puts "   🏭 Corporate: corporate@simplesetup.ae (password: password123)"
puts "   👑 Admin: admin@simplesetup.ae (password: admin123456)"
puts "   🎧 Support: support@simplesetup.ae (password: support123)"
puts "   📊 Accountant: accountant@simplesetup.ae (password: accounting123)"

puts "\n🔒 Security Features Enabled:"
puts "   • Account locking after 10 failed attempts"
puts "   • Warning email at 6 failed attempts"
puts "   • 24-hour session timeout"
puts "   • Email change notifications"
puts "   • Password change notifications"
puts "   • 3-day email confirmation window"

puts "\n✅ Demo users created successfully!"

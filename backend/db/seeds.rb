# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Starting database seeding..."

# Load seed files in order
seed_files = [
  'freezones',
  'ifza_pricing',
  'business_activities'
]

seed_files.each do |seed_file|
  seed_path = Rails.root.join('db', 'seeds', "#{seed_file}.rb")
  
  if File.exist?(seed_path)
    puts "\n📂 Loading #{seed_file} seeds..."
    load seed_path
  else
    puts "⚠️  Seed file not found: #{seed_path}"
  end
end

puts "\n🎉 Database seeding completed!"

require 'csv'

puts "Loading business activities data..."

# Path to the CSV file
csv_file_path = Rails.root.join('..', 'data', 'IFZA Business Activities - Sheet1.csv')

unless File.exist?(csv_file_path)
  puts "CSV file not found at: #{csv_file_path}"
  puts "Please ensure the CSV file is in the project root directory."
  return
end

# Clear existing data
BusinessActivity.destroy_all

# Read and parse CSV
CSV.foreach(csv_file_path, headers: true, encoding: 'UTF-8') do |row|
  begin
    BusinessActivity.create!(
      freezone: row['Freezone']&.strip,
      activity_code: row['Activity Code']&.strip,
      activity_name: row['Activity Name']&.strip,
      activity_description: row['Activity Description']&.strip,
      activity_type: row['Type']&.strip,
      property_requirements: row['Property Requirements']&.strip,
      notes: row['Notes']&.strip,
      classification: row['Classification']&.strip,
      regulation_type: row['Regulation Type']&.strip,
      approving_entity_1: row['Approving Entity 1']&.strip,
      approving_entity_2: row['Approving Entity 2']&.strip
    )
  rescue => e
    puts "Error creating business activity for row: #{row['Activity Code']} - #{e.message}"
  end
end

puts "Successfully loaded #{BusinessActivity.count} business activities"

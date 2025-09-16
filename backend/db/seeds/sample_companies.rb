# Sample companies for testing the Company Owner dashboard

# Create a sample user (owner)
owner = User.find_or_create_by(email: 'owner@sampletech.com') do |user|
  user.password = 'sampleowner123'
  user.password_confirmation = 'sampleowner123'
  user.first_name = 'John'
  user.last_name = 'Doe'
  user.confirmed_at = Time.current
end

# Create IFZA freezone if it doesn't exist
ifza = Freezone.find_or_create_by(code: 'IFZA') do |freezone|
  freezone.name = 'International Free Zone Authority'
  freezone.location = 'Dubai, UAE'
  freezone.active = true
  freezone.website_url = 'https://ifza.ae'
  freezone.contact_email = 'info@ifza.ae'
  freezone.contact_phone = '+971 4 123 4567'
end

# Create a sample company
company = Company.find_or_create_by(name: 'Sample Tech Solutions LLC') do |comp|
  comp.owner = owner
  comp.free_zone = 'IFZA'
  comp.status = 'issued'
  comp.license_number = 'IFZA-2024-001234'
  comp.trade_name = 'Sample Tech'
  comp.activity_codes = ['62010', '62020'] # Software development activities
  comp.formation_data = {
    'company_names' => ['Sample Tech Solutions LLC', 'Sample Tech LLC'],
    'license_years' => 1,
    'visa_count' => 5,
    'partner_visa_count' => 0,
    'share_capital' => 50000,
    'share_value' => 1000,
    'establishment_card' => true,
    'company_website' => 'https://sampletech.com',
    'operating_name_arabic' => 'شركة سامبل تك للحلول التقنية ذ.م.م',
    'shareholders' => [
      {
        'type' => 'Individual',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@sampletech.com',
        'mobile' => '+971 50 123 4567',
        'nationality' => 'United States',
        'passport_number' => 'US123456789',
        'share_percentage' => 100,
        'roles' => ['shareholder', 'director'],
        'is_pep' => false
      }
    ],
    'directors' => [
      {
        'type' => 'Individual',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@sampletech.com',
        'mobile' => '+971 50 123 4567',
        'nationality' => 'United States',
        'passport_number' => 'US123456789',
        'roles' => ['director']
      }
    ],
    'documents_uploaded' => true
  }
  comp.formation_step = 'submitted'
  comp.metadata = {
    'website' => 'https://sampletech.com',
    'operating_name_arabic' => 'شركة سامبل تك للحلول التقنية ذ.م.م',
    'license_issue_date' => '2024-02-01',
    'license_expiry_date' => '2025-02-01',
    'first_license_issue_date' => '2024-02-01',
    'establishment_card_number' => 'EST-2024-001234',
    'establishment_card_issue_date' => '2024-02-01',
    'establishment_card_expiry_date' => '2025-02-01'
  }
end

# Create company membership for the owner
CompanyMembership.find_or_create_by(company: company, user: owner) do |membership|
  membership.role = 'owner'
  membership.accepted_at = Time.current
end

# Create corporate tax registration
TaxRegistration.find_or_create_by(company: company, registration_type: 'corporate_tax') do |tax_reg|
  tax_reg.status = 'not_registered'
  tax_reg.registration_details = {
    'company_formation_date' => company.created_at.to_date.to_s,
    'business_activities' => company.activity_codes,
    'estimated_annual_turnover' => 500000
  }
end

# Create sample documents
Document.find_or_create_by(company: company, document_type: 'trade_license') do |doc|
  doc.name = 'Trade License'
  doc.file_name = 'trade_license_001234.pdf'
  doc.file_size = 1024000 # 1MB
  doc.content_type = 'application/pdf'
  doc.storage_path = 'documents/trade_license_001234.pdf'
  doc.storage_bucket = 'documents'
  doc.ocr_status = 'completed'
  doc.uploaded_at = Time.current
  doc.processed_at = Time.current
  doc.user = owner
end

Document.find_or_create_by(company: company, document_type: 'moa') do |doc|
  doc.name = 'Certificate of Incorporation'
  doc.file_name = 'certificate_incorporation_001234.pdf'
  doc.file_size = 800000 # 800KB
  doc.content_type = 'application/pdf'
  doc.storage_path = 'documents/certificate_incorporation_001234.pdf'
  doc.storage_bucket = 'documents'
  doc.ocr_status = 'completed'
  doc.uploaded_at = Time.current
  doc.processed_at = Time.current
  doc.user = owner
end

Document.find_or_create_by(company: company, document_type: 'aoa') do |doc|
  doc.name = 'Register of Directors'
  doc.file_name = 'register_directors_001234.pdf'
  doc.file_size = 600000 # 600KB
  doc.content_type = 'application/pdf'
  doc.storage_path = 'documents/register_directors_001234.pdf'
  doc.storage_bucket = 'documents'
  doc.ocr_status = 'completed'
  doc.uploaded_at = Time.current
  doc.processed_at = Time.current
  doc.user = owner
end

puts "✅ Sample company data created successfully!"
puts "📋 Company: #{company.name}"
puts "👤 Owner: #{owner.full_name} (#{owner.email})"
puts "🏢 Free Zone: #{company.free_zone}"
puts "📄 License: #{company.license_number}"
puts "📊 Status: #{company.status}"
puts "🗂️  Documents: #{company.documents.count} files"


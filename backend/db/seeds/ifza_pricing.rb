# IFZA Pricing seed data based on ifza-client-pricing.json
puts "Creating IFZA pricing catalog..."

# Find IFZA freezone
ifza = Freezone.find_by(code: 'IFZA')
unless ifza
  puts "✗ IFZA freezone not found. Please run freezone seeds first."
  return
end

# Create pricing catalog
pricing_catalog = PricingCatalog.find_or_create_by(
  freezone: ifza,
  version: '2024.1'
) do |catalog|
  catalog.currency = 'AED'
  catalog.description = 'IFZA Standard Pricing Catalog 2024'
  catalog.terms = [
    'Prices VAT inclusive',
    'AED currency', 
    'Overstay fines = 400 + actual fine',
    '3 activities and 3 shareholders included free'
  ]
  catalog.active = true
  catalog.effective_from = Date.parse('2024-01-01')
  catalog.metadata = {
    source: 'ifza-client-pricing.json',
    created_by: 'seed_data'
  }
end

if pricing_catalog.persisted?
  puts "✓ Created pricing catalog for IFZA"
else
  puts "✗ Failed to create pricing catalog: #{pricing_catalog.errors.full_messages.join(', ')}"
  return
end

# License packages data from JSON
license_packages_data = [
  # 1-year packages
  { duration_years: 1, package_type: 'Commercial', visas_included: 0, price_vat_inclusive: 12900 },
  { duration_years: 1, package_type: 'Commercial', visas_included: 1, price_vat_inclusive: 14900 },
  { duration_years: 1, package_type: 'Commercial', visas_included: 2, price_vat_inclusive: 16900 },
  { duration_years: 1, package_type: 'Commercial', visas_included: 3, price_vat_inclusive: 18900 },
  { duration_years: 1, package_type: 'Commercial', visas_included: 4, price_vat_inclusive: 20900 },
  { duration_years: 1, package_type: 'Professional', visas_included: 0, price_vat_inclusive: 12900 },
  { duration_years: 1, package_type: 'Professional', visas_included: 1, price_vat_inclusive: 14900 },
  { duration_years: 1, package_type: 'Professional', visas_included: 2, price_vat_inclusive: 16900 },
  { duration_years: 1, package_type: 'Professional', visas_included: 3, price_vat_inclusive: 18900 },
  { duration_years: 1, package_type: 'Professional', visas_included: 4, price_vat_inclusive: 20900 },
  
  # 2-year packages
  { duration_years: 2, package_type: 'Commercial', visas_included: 0, price_vat_inclusive: 21900 },
  { duration_years: 2, package_type: 'Commercial', visas_included: 1, price_vat_inclusive: 25300 },
  { duration_years: 2, package_type: 'Commercial', visas_included: 2, price_vat_inclusive: 28700 },
  { duration_years: 2, package_type: 'Commercial', visas_included: 3, price_vat_inclusive: 32100 },
  { duration_years: 2, package_type: 'Commercial', visas_included: 4, price_vat_inclusive: 35500 },
  { duration_years: 2, package_type: 'Professional', visas_included: 0, price_vat_inclusive: 21900 },
  { duration_years: 2, package_type: 'Professional', visas_included: 1, price_vat_inclusive: 25300 },
  { duration_years: 2, package_type: 'Professional', visas_included: 2, price_vat_inclusive: 28700 },
  { duration_years: 2, package_type: 'Professional', visas_included: 3, price_vat_inclusive: 32100 },
  { duration_years: 2, package_type: 'Professional', visas_included: 4, price_vat_inclusive: 35500 },
  
  # 3-year packages
  { duration_years: 3, package_type: 'Commercial', visas_included: 0, price_vat_inclusive: 31000 },
  { duration_years: 3, package_type: 'Commercial', visas_included: 1, price_vat_inclusive: 35800 },
  { duration_years: 3, package_type: 'Commercial', visas_included: 2, price_vat_inclusive: 40600 },
  { duration_years: 3, package_type: 'Commercial', visas_included: 3, price_vat_inclusive: 45400 },
  { duration_years: 3, package_type: 'Commercial', visas_included: 4, price_vat_inclusive: 50200 },
  { duration_years: 3, package_type: 'Professional', visas_included: 0, price_vat_inclusive: 31000 },
  { duration_years: 3, package_type: 'Professional', visas_included: 1, price_vat_inclusive: 35800 },
  { duration_years: 3, package_type: 'Professional', visas_included: 2, price_vat_inclusive: 40600 },
  { duration_years: 3, package_type: 'Professional', visas_included: 3, price_vat_inclusive: 45400 },
  { duration_years: 3, package_type: 'Professional', visas_included: 4, price_vat_inclusive: 50200 },
  
  # 5-year packages
  { duration_years: 5, package_type: 'Commercial', visas_included: 0, price_vat_inclusive: 45200 },
  { duration_years: 5, package_type: 'Commercial', visas_included: 1, price_vat_inclusive: 52200 },
  { duration_years: 5, package_type: 'Commercial', visas_included: 2, price_vat_inclusive: 59200 },
  { duration_years: 5, package_type: 'Commercial', visas_included: 3, price_vat_inclusive: 66200 },
  { duration_years: 5, package_type: 'Commercial', visas_included: 4, price_vat_inclusive: 73200 },
  { duration_years: 5, package_type: 'Professional', visas_included: 0, price_vat_inclusive: 45200 },
  { duration_years: 5, package_type: 'Professional', visas_included: 1, price_vat_inclusive: 52200 },
  { duration_years: 5, package_type: 'Professional', visas_included: 2, price_vat_inclusive: 59200 },
  { duration_years: 5, package_type: 'Professional', visas_included: 3, price_vat_inclusive: 66200 },
  { duration_years: 5, package_type: 'Professional', visas_included: 4, price_vat_inclusive: 73200 }
]

# Create license packages
license_packages_data.each do |package_data|
  package = LicensePackage.find_or_create_by(
    pricing_catalog: pricing_catalog,
    package_type: package_data[:package_type],
    duration_years: package_data[:duration_years],
    visas_included: package_data[:visas_included]
  ) do |p|
    p.price_vat_inclusive = package_data[:price_vat_inclusive]
    p.vat_rate = 0.05
    p.active = true
    p.included_services = [
      'Trade License',
      'Initial Approval',
      'Memorandum of Association',
      'Share Certificate',
      'Commercial Registration'
    ]
  end
  
  if package.persisted?
    puts "✓ Created license package: #{package.package_type} #{package.duration_years}yr #{package.visas_included}visa - AED #{package.price_vat_inclusive}"
  else
    puts "✗ Failed to create license package: #{package.errors.full_messages.join(', ')}"
  end
end

# Business activity fees
business_activity_fees_data = [
  { code: 'activity.extra', label: 'Extra Business Activity', price: 1000 },
  { code: 'activity.cross', label: 'Cross Business Activity', price: 2000 },
  { code: 'activity.general_trading', label: 'General Trading', price: 10000 },
  { code: 'activity.single_family_office', label: 'Single Family Office Activity', price: 10000 }
]

business_activity_fees_data.each do |fee_data|
  fee = BusinessActivityFee.find_or_create_by(
    pricing_catalog: pricing_catalog,
    code: fee_data[:code]
  ) do |f|
    f.label = fee_data[:label]
    f.price = fee_data[:price]
    f.active = true
  end
  
  if fee.persisted?
    puts "✓ Created business activity fee: #{fee.label} - AED #{fee.price}"
  else
    puts "✗ Failed to create business activity fee: #{fee.errors.full_messages.join(', ')}"
  end
end

# Shareholding fees
shareholding_fees_data = [
  { code: 'shareholder.individual_extra', label: 'Additional Individual Shareholder', price: 350 },
  { code: 'shareholder.corporate', label: 'Corporate Shareholder', price: 750 }
]

shareholding_fees_data.each do |fee_data|
  fee = ShareholdingFee.find_or_create_by(
    pricing_catalog: pricing_catalog,
    code: fee_data[:code]
  ) do |f|
    f.label = fee_data[:label]
    f.price = fee_data[:price]
    f.active = true
  end
  
  if fee.persisted?
    puts "✓ Created shareholding fee: #{fee.label} - AED #{fee.price}"
  else
    puts "✗ Failed to create shareholding fee: #{fee.errors.full_messages.join(', ')}"
  end
end

# Government fees
government_fees_data = [
  { code: 'ecard.new', label: 'Establishment Card - Initial', price: 2000, fee_type: 'initial' },
  { code: 'ecard.renew', label: 'Establishment Card - Renewal', price: 2200, fee_type: 'renewal' },
  { code: 'ecard.amend', label: 'Establishment Card - Amendment', price: 500, fee_type: 'amendment' }
]

government_fees_data.each do |fee_data|
  fee = GovernmentFee.find_or_create_by(
    pricing_catalog: pricing_catalog,
    code: fee_data[:code]
  ) do |f|
    f.label = fee_data[:label]
    f.price = fee_data[:price]
    f.fee_type = fee_data[:fee_type]
    f.active = true
  end
  
  if fee.persisted?
    puts "✓ Created government fee: #{fee.label} - AED #{fee.price}"
  else
    puts "✗ Failed to create government fee: #{fee.errors.full_messages.join(', ')}"
  end
end

# Service fees (preapprovals and deposits)
service_fees_data = [
  { code: 'preapproval.name_reservation', label: 'License Pre-Approval / Name Reservation', price: 500, category: 'preapproval' },
  { code: 'deposit.lock_in', label: 'License Downpayment', price: 5000, category: 'deposit' }
]

service_fees_data.each do |fee_data|
  fee = ServiceFee.find_or_create_by(
    pricing_catalog: pricing_catalog,
    code: fee_data[:code]
  ) do |f|
    f.label = fee_data[:label]
    f.price = fee_data[:price]
    f.category = fee_data[:category]
    f.active = true
  end
  
  if fee.persisted?
    puts "✓ Created service fee: #{fee.label} - AED #{fee.price}"
  else
    puts "✗ Failed to create service fee: #{fee.errors.full_messages.join(', ')}"
  end
end

# Pricing promotions
promotions_data = [
  {
    key: 'general_trading_waived',
    title: 'General Trading Fee Waived',
    description: 'General Trading fee waived for new apps and 3 renewals',
    applies_to: 'new_licenses',
    promotion_type: 'waived_fee',
    valid_from: Date.parse('2024-08-01'),
    valid_until: Date.parse('2025-08-31'),
    conditions: {
      applies_to_codes: ['activity.general_trading'],
      renewal_cycles: 3
    }
  },
  {
    key: 'cross_activity_waived',
    title: 'Cross Activity Fee Waived', 
    description: 'Cross Activity fee waived for new apps and 3 renewals',
    applies_to: 'new_licenses',
    promotion_type: 'waived_fee',
    valid_from: Date.parse('2024-08-01'),
    valid_until: Date.parse('2025-08-31'),
    conditions: {
      applies_to_codes: ['activity.cross'],
      renewal_cycles: 3
    }
  },
  {
    key: 'upgrade_fee_waived',
    title: 'Upgrade Amendment Fee Waived',
    description: 'Upgrade amendment fee waived for life if licensed Aug 2025',
    applies_to: 'new_licenses',
    promotion_type: 'waived_fee',
    valid_from: Date.parse('2025-08-01'),
    valid_until: Date.parse('2025-08-31'),
    conditions: {
      lifetime_benefit: true,
      license_period: 'August 2025'
    }
  }
]

promotions_data.each do |promo_data|
  promotion = PricingPromotion.find_or_create_by(
    pricing_catalog: pricing_catalog,
    key: promo_data[:key]
  ) do |p|
    p.title = promo_data[:title]
    p.description = promo_data[:description]
    p.applies_to = promo_data[:applies_to]
    p.promotion_type = promo_data[:promotion_type]
    p.valid_from = promo_data[:valid_from]
    p.valid_until = promo_data[:valid_until]
    p.conditions = promo_data[:conditions]
    p.active = true
  end
  
  if promotion.persisted?
    puts "✓ Created promotion: #{promotion.title}"
  else
    puts "✗ Failed to create promotion: #{promotion.errors.full_messages.join(', ')}"
  end
end

puts "Completed IFZA pricing catalog seeding."

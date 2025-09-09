# Freezone seed data
puts "Creating freezones..."

freezones_data = [
  {
    name: "International Free Zone Authority (IFZA)",
    code: "IFZA", 
    location: "Dubai",
    description: "A leading free zone in Dubai offering comprehensive business solutions for international companies.",
    active: true,
    website_url: "https://www.ifza.com",
    contact_email: "info@ifza.com",
    contact_phone: "+971 4 123 4567",
    metadata: {
      established: "2009",
      sectors: ["trading", "consulting", "technology", "finance", "manufacturing"],
      min_share_capital: 1000,
      currency: "AED"
    }
  },
  {
    name: "Meydan Free Zone",
    code: "MEYDAN",
    location: "Dubai", 
    description: "A dynamic free zone located in the heart of Dubai's business district.",
    active: true,
    website_url: "https://www.meydanfz.ae",
    contact_email: "info@meydanfz.ae",
    contact_phone: "+971 4 987 6543",
    metadata: {
      established: "2009",
      sectors: ["business services", "trading", "technology", "media"],
      min_share_capital: 1000,
      currency: "AED"
    }
  },
  {
    name: "Sharjah Airport International Free Zone (SAIF Zone)",
    code: "SHAMS",
    location: "Sharjah",
    description: "One of the UAE's premier free zones offering excellent connectivity and business opportunities.",
    active: true,
    website_url: "https://www.shams.ae",
    contact_email: "info@shams.ae", 
    contact_phone: "+971 6 557 4444",
    metadata: {
      established: "1995",
      sectors: ["logistics", "trading", "manufacturing", "services"],
      min_share_capital: 1000,
      currency: "AED"
    }
  },
  {
    name: "Ajman Free Zone",
    code: "AJMAN",
    location: "Ajman",
    description: "A cost-effective free zone solution with streamlined processes for business setup.",
    active: true,
    website_url: "https://www.afza.gov.ae",
    contact_email: "info@afza.gov.ae",
    contact_phone: "+971 6 748 0000",
    metadata: {
      established: "1988",
      sectors: ["trading", "services", "manufacturing", "logistics"],
      min_share_capital: 1000,
      currency: "AED"
    }
  },
  {
    name: "Dubai International Financial Centre (DIFC)",
    code: "DIFC",
    location: "Dubai",
    description: "The leading financial hub in the Middle East, Africa and South Asia region.",
    active: false,
    website_url: "https://www.difc.ae",
    contact_email: "info@difc.ae",
    contact_phone: "+971 4 362 2222",
    metadata: {
      established: "2004",
      sectors: ["financial services", "fintech", "banking", "insurance"],
      min_share_capital: 500000,
      currency: "USD"
    }
  },
  {
    name: "Abu Dhabi Global Market (ADGM)",
    code: "ADGM",
    location: "Abu Dhabi",
    description: "An international financial centre that bridges the gap between East and West.",
    active: false,
    website_url: "https://www.adgm.com",
    contact_email: "info@adgm.com", 
    contact_phone: "+971 2 333 8888",
    metadata: {
      established: "2013",
      sectors: ["financial services", "fintech", "banking", "asset management"],
      min_share_capital: 150000,
      currency: "USD"
    }
  }
]

freezones_data.each do |freezone_attrs|
  freezone = Freezone.find_or_create_by(code: freezone_attrs[:code]) do |f|
    f.assign_attributes(freezone_attrs)
  end
  
  if freezone.persisted?
    puts "✓ Created/Updated freezone: #{freezone.name} (#{freezone.code}) - #{freezone.active? ? 'Active' : 'Inactive'}"
  else
    puts "✗ Failed to create freezone: #{freezone_attrs[:name]} - #{freezone.errors.full_messages.join(', ')}"
  end
end

puts "Completed freezone seeding."

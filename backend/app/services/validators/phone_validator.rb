class PhoneValidator < BaseValidator
  # Common international dialing codes with metadata
  COUNTRY_CODES = {
    '+1' => { countries: ['United States', 'Canada'], min_length: 10, max_length: 10 },
    '+7' => { countries: ['Russia', 'Kazakhstan'], min_length: 10, max_length: 10 },
    '+20' => { countries: ['Egypt'], min_length: 10, max_length: 10 },
    '+27' => { countries: ['South Africa'], min_length: 9, max_length: 9 },
    '+30' => { countries: ['Greece'], min_length: 10, max_length: 10 },
    '+31' => { countries: ['Netherlands'], min_length: 9, max_length: 9 },
    '+32' => { countries: ['Belgium'], min_length: 8, max_length: 9 },
    '+33' => { countries: ['France'], min_length: 9, max_length: 9 },
    '+34' => { countries: ['Spain'], min_length: 9, max_length: 9 },
    '+36' => { countries: ['Hungary'], min_length: 8, max_length: 9 },
    '+39' => { countries: ['Italy'], min_length: 9, max_length: 10 },
    '+40' => { countries: ['Romania'], min_length: 9, max_length: 9 },
    '+41' => { countries: ['Switzerland'], min_length: 9, max_length: 9 },
    '+43' => { countries: ['Austria'], min_length: 10, max_length: 13 },
    '+44' => { countries: ['United Kingdom'], min_length: 10, max_length: 10 },
    '+45' => { countries: ['Denmark'], min_length: 8, max_length: 8 },
    '+46' => { countries: ['Sweden'], min_length: 7, max_length: 9 },
    '+47' => { countries: ['Norway'], min_length: 8, max_length: 8 },
    '+48' => { countries: ['Poland'], min_length: 9, max_length: 9 },
    '+49' => { countries: ['Germany'], min_length: 10, max_length: 11 },
    '+51' => { countries: ['Peru'], min_length: 9, max_length: 9 },
    '+52' => { countries: ['Mexico'], min_length: 10, max_length: 10 },
    '+53' => { countries: ['Cuba'], min_length: 8, max_length: 8 },
    '+54' => { countries: ['Argentina'], min_length: 10, max_length: 10 },
    '+55' => { countries: ['Brazil'], min_length: 10, max_length: 11 },
    '+56' => { countries: ['Chile'], min_length: 9, max_length: 9 },
    '+57' => { countries: ['Colombia'], min_length: 10, max_length: 10 },
    '+58' => { countries: ['Venezuela'], min_length: 10, max_length: 10 },
    '+60' => { countries: ['Malaysia'], min_length: 7, max_length: 9 },
    '+61' => { countries: ['Australia'], min_length: 9, max_length: 9 },
    '+62' => { countries: ['Indonesia'], min_length: 9, max_length: 12 },
    '+63' => { countries: ['Philippines'], min_length: 10, max_length: 10 },
    '+64' => { countries: ['New Zealand'], min_length: 8, max_length: 10 },
    '+65' => { countries: ['Singapore'], min_length: 8, max_length: 8 },
    '+66' => { countries: ['Thailand'], min_length: 9, max_length: 9 },
    '+81' => { countries: ['Japan'], min_length: 10, max_length: 10 },
    '+82' => { countries: ['South Korea'], min_length: 9, max_length: 10 },
    '+84' => { countries: ['Vietnam'], min_length: 9, max_length: 10 },
    '+86' => { countries: ['China'], min_length: 11, max_length: 11 },
    '+90' => { countries: ['Turkey'], min_length: 10, max_length: 10 },
    '+91' => { countries: ['India'], min_length: 10, max_length: 10 },
    '+92' => { countries: ['Pakistan'], min_length: 10, max_length: 10 },
    '+93' => { countries: ['Afghanistan'], min_length: 9, max_length: 9 },
    '+94' => { countries: ['Sri Lanka'], min_length: 9, max_length: 9 },
    '+95' => { countries: ['Myanmar'], min_length: 8, max_length: 9 },
    '+98' => { countries: ['Iran'], min_length: 10, max_length: 10 },
    '+212' => { countries: ['Morocco'], min_length: 9, max_length: 9 },
    '+213' => { countries: ['Algeria'], min_length: 9, max_length: 9 },
    '+216' => { countries: ['Tunisia'], min_length: 8, max_length: 8 },
    '+218' => { countries: ['Libya'], min_length: 9, max_length: 10 },
    '+220' => { countries: ['Gambia'], min_length: 7, max_length: 7 },
    '+221' => { countries: ['Senegal'], min_length: 9, max_length: 9 },
    '+223' => { countries: ['Mali'], min_length: 8, max_length: 8 },
    '+224' => { countries: ['Guinea'], min_length: 9, max_length: 9 },
    '+225' => { countries: ['Ivory Coast'], min_length: 8, max_length: 8 },
    '+226' => { countries: ['Burkina Faso'], min_length: 8, max_length: 8 },
    '+227' => { countries: ['Niger'], min_length: 8, max_length: 8 },
    '+228' => { countries: ['Togo'], min_length: 8, max_length: 8 },
    '+229' => { countries: ['Benin'], min_length: 8, max_length: 8 },
    '+230' => { countries: ['Mauritius'], min_length: 7, max_length: 8 },
    '+231' => { countries: ['Liberia'], min_length: 7, max_length: 9 },
    '+232' => { countries: ['Sierra Leone'], min_length: 8, max_length: 8 },
    '+233' => { countries: ['Ghana'], min_length: 9, max_length: 9 },
    '+234' => { countries: ['Nigeria'], min_length: 10, max_length: 10 },
    '+235' => { countries: ['Chad'], min_length: 8, max_length: 8 },
    '+236' => { countries: ['Central African Republic'], min_length: 8, max_length: 8 },
    '+237' => { countries: ['Cameroon'], min_length: 9, max_length: 9 },
    '+238' => { countries: ['Cape Verde'], min_length: 7, max_length: 7 },
    '+239' => { countries: ['São Tomé and Príncipe'], min_length: 7, max_length: 7 },
    '+240' => { countries: ['Equatorial Guinea'], min_length: 9, max_length: 9 },
    '+241' => { countries: ['Gabon'], min_length: 7, max_length: 8 },
    '+242' => { countries: ['Republic of the Congo'], min_length: 9, max_length: 9 },
    '+243' => { countries: ['Democratic Republic of the Congo'], min_length: 9, max_length: 9 },
    '+244' => { countries: ['Angola'], min_length: 9, max_length: 9 },
    '+245' => { countries: ['Guinea-Bissau'], min_length: 9, max_length: 9 },
    '+248' => { countries: ['Seychelles'], min_length: 7, max_length: 7 },
    '+249' => { countries: ['Sudan'], min_length: 9, max_length: 9 },
    '+250' => { countries: ['Rwanda'], min_length: 9, max_length: 9 },
    '+251' => { countries: ['Ethiopia'], min_length: 9, max_length: 9 },
    '+252' => { countries: ['Somalia'], min_length: 8, max_length: 9 },
    '+253' => { countries: ['Djibouti'], min_length: 8, max_length: 8 },
    '+254' => { countries: ['Kenya'], min_length: 9, max_length: 10 },
    '+255' => { countries: ['Tanzania'], min_length: 9, max_length: 9 },
    '+256' => { countries: ['Uganda'], min_length: 9, max_length: 9 },
    '+257' => { countries: ['Burundi'], min_length: 8, max_length: 8 },
    '+258' => { countries: ['Mozambique'], min_length: 9, max_length: 9 },
    '+260' => { countries: ['Zambia'], min_length: 9, max_length: 9 },
    '+261' => { countries: ['Madagascar'], min_length: 9, max_length: 9 },
    '+263' => { countries: ['Zimbabwe'], min_length: 9, max_length: 9 },
    '+264' => { countries: ['Namibia'], min_length: 9, max_length: 9 },
    '+265' => { countries: ['Malawi'], min_length: 9, max_length: 9 },
    '+266' => { countries: ['Lesotho'], min_length: 8, max_length: 8 },
    '+267' => { countries: ['Botswana'], min_length: 8, max_length: 8 },
    '+268' => { countries: ['Eswatini'], min_length: 8, max_length: 8 },
    '+269' => { countries: ['Comoros'], min_length: 7, max_length: 7 },
    '+351' => { countries: ['Portugal'], min_length: 9, max_length: 9 },
    '+352' => { countries: ['Luxembourg'], min_length: 8, max_length: 9 },
    '+353' => { countries: ['Ireland'], min_length: 9, max_length: 9 },
    '+354' => { countries: ['Iceland'], min_length: 7, max_length: 7 },
    '+355' => { countries: ['Albania'], min_length: 9, max_length: 9 },
    '+356' => { countries: ['Malta'], min_length: 8, max_length: 8 },
    '+357' => { countries: ['Cyprus'], min_length: 8, max_length: 8 },
    '+358' => { countries: ['Finland'], min_length: 9, max_length: 10 },
    '+359' => { countries: ['Bulgaria'], min_length: 9, max_length: 9 },
    '+370' => { countries: ['Lithuania'], min_length: 8, max_length: 8 },
    '+371' => { countries: ['Latvia'], min_length: 8, max_length: 8 },
    '+372' => { countries: ['Estonia'], min_length: 7, max_length: 8 },
    '+373' => { countries: ['Moldova'], min_length: 8, max_length: 8 },
    '+374' => { countries: ['Armenia'], min_length: 8, max_length: 8 },
    '+375' => { countries: ['Belarus'], min_length: 9, max_length: 9 },
    '+376' => { countries: ['Andorra'], min_length: 6, max_length: 6 },
    '+377' => { countries: ['Monaco'], min_length: 8, max_length: 9 },
    '+378' => { countries: ['San Marino'], min_length: 8, max_length: 10 },
    '+380' => { countries: ['Ukraine'], min_length: 9, max_length: 9 },
    '+381' => { countries: ['Serbia'], min_length: 9, max_length: 9 },
    '+382' => { countries: ['Montenegro'], min_length: 8, max_length: 8 },
    '+383' => { countries: ['Kosovo'], min_length: 8, max_length: 8 },
    '+385' => { countries: ['Croatia'], min_length: 9, max_length: 9 },
    '+386' => { countries: ['Slovenia'], min_length: 8, max_length: 8 },
    '+387' => { countries: ['Bosnia and Herzegovina'], min_length: 8, max_length: 8 },
    '+389' => { countries: ['North Macedonia'], min_length: 8, max_length: 8 },
    '+420' => { countries: ['Czech Republic'], min_length: 9, max_length: 9 },
    '+421' => { countries: ['Slovakia'], min_length: 9, max_length: 9 },
    '+423' => { countries: ['Liechtenstein'], min_length: 7, max_length: 7 },
    '+880' => { countries: ['Bangladesh'], min_length: 10, max_length: 10 },
    '+960' => { countries: ['Maldives'], min_length: 7, max_length: 7 },
    '+961' => { countries: ['Lebanon'], min_length: 8, max_length: 8 },
    '+962' => { countries: ['Jordan'], min_length: 9, max_length: 9 },
    '+963' => { countries: ['Syria'], min_length: 9, max_length: 9 },
    '+964' => { countries: ['Iraq'], min_length: 10, max_length: 10 },
    '+965' => { countries: ['Kuwait'], min_length: 8, max_length: 8 },
    '+966' => { countries: ['Saudi Arabia'], min_length: 9, max_length: 9 },
    '+967' => { countries: ['Yemen'], min_length: 9, max_length: 9 },
    '+968' => { countries: ['Oman'], min_length: 8, max_length: 8 },
    '+970' => { countries: ['Palestine'], min_length: 9, max_length: 9 },
    '+971' => { countries: ['United Arab Emirates'], min_length: 9, max_length: 9 },
    '+972' => { countries: ['Israel'], min_length: 9, max_length: 9 },
    '+973' => { countries: ['Bahrain'], min_length: 8, max_length: 8 },
    '+974' => { countries: ['Qatar'], min_length: 8, max_length: 8 },
    '+975' => { countries: ['Bhutan'], min_length: 8, max_length: 8 },
    '+976' => { countries: ['Mongolia'], min_length: 8, max_length: 8 },
    '+977' => { countries: ['Nepal'], min_length: 10, max_length: 10 },
    '+992' => { countries: ['Tajikistan'], min_length: 9, max_length: 9 },
    '+993' => { countries: ['Turkmenistan'], min_length: 8, max_length: 8 },
    '+994' => { countries: ['Azerbaijan'], min_length: 9, max_length: 9 },
    '+995' => { countries: ['Georgia'], min_length: 9, max_length: 9 },
    '+996' => { countries: ['Kyrgyzstan'], min_length: 9, max_length: 9 },
    '+998' => { countries: ['Uzbekistan'], min_length: 9, max_length: 9 }
  }.freeze

  def initialize(phone_number: nil, country_code: nil, require_country_code: true)
    @phone_number = phone_number
    @country_code = country_code
    @require_country_code = require_country_code
  end

  def validate
    @errors = []
    
    return errors if @phone_number.blank?
    
    # Clean the phone number
    cleaned_number = clean_phone_number(@phone_number)
    
    # Extract country code if present in the number
    detected_country_code, local_number = extract_country_code(cleaned_number)
    
    # Use provided country code if no code detected in number
    final_country_code = detected_country_code || @country_code
    
    # Validate based on requirements
    if @require_country_code && final_country_code.blank?
      add_error "Country code is required"
    elsif final_country_code.present?
      validate_with_country_code(final_country_code, local_number || cleaned_number)
    else
      validate_general_format(cleaned_number)
    end
    
    errors
  end

  # Class method for easy validation
  def self.format_phone_number(phone_number, country_code = nil)
    cleaned = phone_number.to_s.gsub(/\D/, '')
    
    # If starts with country code, format accordingly
    if cleaned.start_with?('971')
      # UAE format: +971 50 123 4567
      "+971 #{cleaned[3..4]} #{cleaned[5..7]} #{cleaned[8..11]}"
    elsif country_code
      "#{country_code} #{cleaned}"
    else
      cleaned
    end
  end

  # Extract just the country code
  def self.extract_country_code_only(phone_number)
    cleaned = phone_number.to_s.gsub(/[^\d+]/, '')
    cleaned = "+#{cleaned}" unless cleaned.start_with?('+')
    
    # Try 1-4 digit codes
    (1..4).to_a.reverse.each do |length|
      potential_code = cleaned[0..length]
      return potential_code if COUNTRY_CODES[potential_code]
    end
    
    nil
  end

  private

  def clean_phone_number(number)
    # Remove all non-digit characters except leading +
    cleaned = number.to_s.gsub(/[^\d+]/, '')
    # Ensure + is only at the beginning
    cleaned = cleaned.gsub('+', '')
    cleaned = "+#{cleaned}" if number.to_s.start_with?('+')
    cleaned
  end

  def extract_country_code(number)
    return [nil, number] unless number.start_with?('+')
    
    # Try matching country codes from longest to shortest
    (1..4).to_a.reverse.each do |length|
      potential_code = number[0..length]
      if COUNTRY_CODES[potential_code]
        local_number = number[(length + 1)..-1]
        return [potential_code, local_number]
      end
    end
    
    [nil, number]
  end

  def validate_with_country_code(country_code, local_number)
    country_info = COUNTRY_CODES[country_code]
    
    unless country_info
      add_error "Invalid country code: #{country_code}"
      return
    end
    
    # Remove any non-digits from local number
    clean_local = local_number.to_s.gsub(/\D/, '')
    
    if clean_local.length < country_info[:min_length]
      add_error "Phone number too short for #{country_info[:countries].first}"
    elsif clean_local.length > country_info[:max_length]
      add_error "Phone number too long for #{country_info[:countries].first}"
    end
    
    # Additional validation for specific countries
    case country_code
    when '+971'
      # UAE mobile numbers typically start with 50, 52, 54, 55, 56, 58
      unless clean_local =~ /^5[024568]/
        add_error "Invalid UAE mobile number format"
      end
    when '+1'
      # US/Canada numbers can't start with 0 or 1
      if clean_local[0] == '0' || clean_local[0] == '1'
        add_error "Invalid North American phone number format"
      end
    when '+44'
      # UK mobile numbers typically start with 7
      unless clean_local =~ /^7/
        add_error "Invalid UK mobile number format"
      end
    end
  end

  def validate_general_format(number)
    # General validation when no country code
    clean = number.gsub(/\D/, '')
    
    if clean.length < 7
      add_error "Phone number too short"
    elsif clean.length > 15
      add_error "Phone number too long"
    end
    
    # Check for obviously invalid patterns
    if clean =~ /^0{3,}/ || clean =~ /^1{5,}/
      add_error "Invalid phone number format"
    end
  end
end


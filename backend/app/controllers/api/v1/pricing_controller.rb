class Api::V1::PricingController < Api::V1::BaseController
  skip_before_action :authenticate_user!
  
  # GET /api/v1/pricing/quote?application_id=:id
  def quote
    if params[:application_id].present?
      company = Company.find_by(id: params[:application_id])
      
      if company.nil?
        render json: { error: 'Application not found' }, status: :not_found
        return
      end
      
      quote = calculate_quote_for_company(company)
    else
      # Calculate quote based on provided parameters
      quote = calculate_quote_from_params(params)
    end
    
    render json: {
      success: true,
      quote: quote,
      totalFormatted: format_currency(quote[:total]),
      items: quote[:breakdown]
    }
  end
  
  # GET /api/v1/pricing/catalog
  def catalog
    pricing_data = load_pricing_data
    
    render json: {
      success: true,
      pricing: pricing_data
    }
  end
  
  private
  
  def calculate_quote_for_company(company)
    pricing_data = load_pricing_data
    
    trade_validity = company.trade_license_validity || 1
    visa_package = company.visa_package || 0
    inside_visas = company.inside_country_visas || 0
    outside_visas = company.outside_country_visas || 0
    partner_visa_count = company.partner_visa_count || 0
    establishment_card = company.establishment_card || (visa_package > 0)
    
    breakdown = []
    total = 0
    
    # License fee based on validity years
    license_fee = calculate_license_fee(pricing_data, trade_validity, visa_package)
    if license_fee > 0
      breakdown << {
        code: 'license',
        label: "Trade License (#{trade_validity} year#{'s' if trade_validity > 1})",
        amount: license_fee,
        amountFmt: format_currency(license_fee)
      }
      total += license_fee
    end
    
    # Visa fees
    if visa_package > 0
      # Inside country visas
      if inside_visas > 0
        inside_fee = calculate_visa_fee(pricing_data, inside_visas, 'inside')
        breakdown << {
          code: 'visa_inside',
          label: "Visa Processing - Inside UAE (#{inside_visas})",
          amount: inside_fee,
          amountFmt: format_currency(inside_fee)
        }
        total += inside_fee
      end
      
      # Outside country visas
      if outside_visas > 0
        outside_fee = calculate_visa_fee(pricing_data, outside_visas, 'outside')
        breakdown << {
          code: 'visa_outside',
          label: "Visa Processing - Outside UAE (#{outside_visas})",
          amount: outside_fee,
          amountFmt: format_currency(outside_fee)
        }
        total += outside_fee
      end
    end
    
    # Partner visa fees
    if partner_visa_count > 0
      partner_fee = calculate_partner_visa_fee(pricing_data, partner_visa_count)
      breakdown << {
        code: 'partner_visa',
        label: "Partner Visa (#{partner_visa_count})",
        amount: partner_fee,
        amountFmt: format_currency(partner_fee)
      }
      total += partner_fee
    end
    
    # Establishment card
    if establishment_card && visa_package > 0
      card_fee = pricing_data.dig('establishment_card', 'price') || 0
      if card_fee > 0
        breakdown << {
          code: 'establishment_card',
          label: 'Establishment Card',
          amount: card_fee,
          amountFmt: format_currency(card_fee)
        }
        total += card_fee
      end
    end
    
    # Service fees
    service_fee = pricing_data.dig('service_fee', 'price') || 0
    if service_fee > 0
      breakdown << {
        code: 'service_fee',
        label: 'Service Fee',
        amount: service_fee,
        amountFmt: format_currency(service_fee)
      }
      total += service_fee
    end
    
    {
      total: total,
      breakdown: breakdown,
      currency: 'AED'
    }
  end
  
  def calculate_quote_from_params(params)
    pricing_data = load_pricing_data
    
    trade_validity = params[:trade_license_validity].to_i || 1
    visa_package = params[:visa_package].to_i || 0
    inside_visas = params[:inside_country_visas].to_i || 0
    outside_visas = params[:outside_country_visas].to_i || 0
    partner_visa_count = params[:partner_visa_count].to_i || 0
    establishment_card = params[:establishment_card] == 'true' || visa_package > 0
    
    # Use the same calculation logic as above
    calculate_quote_for_company(
      OpenStruct.new(
        trade_license_validity: trade_validity,
        visa_package: visa_package,
        inside_country_visas: inside_visas,
        outside_country_visas: outside_visas,
        partner_visa_count: partner_visa_count,
        establishment_card: establishment_card
      )
    )
  end
  
  def calculate_license_fee(pricing_data, years, visa_count)
    # Find matching license package
    license_packages = pricing_data['license_packages'] || []
    
    package = license_packages.find do |pkg|
      pkg['years'] == years && pkg['visas'] == visa_count
    end
    
    return 0 unless package
    package['price'] || 0
  end
  
  def calculate_visa_fee(pricing_data, count, location)
    visa_pricing = pricing_data.dig('visa_processing', location) || {}
    base_price = visa_pricing['price_per_visa'] || 0
    base_price * count
  end
  
  def calculate_partner_visa_fee(pricing_data, count)
    partner_pricing = pricing_data['partner_visa'] || {}
    base_price = partner_pricing['price_per_visa'] || 0
    base_price * count
  end
  
  def load_pricing_data
    # Load from JSON file (source of truth)
    file_path = Rails.root.join('..', 'data', 'ifza-client-pricing.json')
    
    if File.exist?(file_path)
      JSON.parse(File.read(file_path))
    else
      # Fallback to default pricing if file not found
      default_pricing_data
    end
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse pricing JSON: #{e.message}"
    default_pricing_data
  end
  
  def default_pricing_data
    {
      'license_packages' => [
        { 'years' => 1, 'visas' => 0, 'price' => 14500 },
        { 'years' => 1, 'visas' => 1, 'price' => 19500 },
        { 'years' => 1, 'visas' => 2, 'price' => 24500 },
        { 'years' => 1, 'visas' => 3, 'price' => 29500 },
        { 'years' => 1, 'visas' => 4, 'price' => 34500 },
        { 'years' => 1, 'visas' => 5, 'price' => 39500 },
        { 'years' => 1, 'visas' => 6, 'price' => 44500 }
      ],
      'visa_processing' => {
        'inside' => { 'price_per_visa' => 3000 },
        'outside' => { 'price_per_visa' => 5000 }
      },
      'partner_visa' => {
        'price_per_visa' => 8000
      },
      'establishment_card' => {
        'price' => 2000
      },
      'service_fee' => {
        'price' => 2500
      }
    }
  end
  
  def format_currency(amount)
    "AED #{number_with_delimiter(amount.to_i)}"
  end
  
  def number_with_delimiter(number)
    number.to_s.gsub(/(\d)(?=(\d\d\d)+(?!\d))/, '\\1,')
  end
end

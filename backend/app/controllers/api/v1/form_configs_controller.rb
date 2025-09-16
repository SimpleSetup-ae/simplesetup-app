class Api::V1::FormConfigsController < Api::V1::BaseController
  # GET /api/v1/form_configs/freezones
  def freezones
    freezones = CompanyFormation::ConfigService.available_freezones.map do |code|
      service = CompanyFormation::ConfigService.new(code)
      {
        code: code,
        name: service.freezone_info[:name] || code,
        tagline: service.freezone_info[:tagline],
        available: service.valid?
      }
    end
    
    render json: {
      data: freezones,
      default: CompanyFormation::ConfigService.default_freezone
    }
  end
  
  # GET /api/v1/form_configs/:freezone
  def show
    freezone_code = params[:freezone]&.upcase
    
    if freezone_code.blank?
      render json: { error: 'Freezone code is required' }, status: :bad_request
      return
    end
    
    config_service = CompanyFormation::ConfigService.new(freezone_code)
    
    unless config_service.valid?
      render json: { 
        error: 'Freezone configuration not found or invalid',
        available_freezones: CompanyFormation::ConfigService.available_freezones
      }, status: :not_found
      return
    end
    
    render json: {
      data: config_service.to_json
    }
  end
  
  # POST /api/v1/form_configs/:freezone/validate
  def validate
    freezone_code = params[:freezone]&.upcase
    validation_type = params[:type]
    data = params[:data] || {}
    
    config_service = CompanyFormation::ConfigService.new(freezone_code)
    
    unless config_service.valid?
      render json: { error: 'Invalid freezone configuration' }, status: :bad_request
      return
    end
    
    result = case validation_type
    when 'company_name'
      config_service.validate_company_name(data[:name])
    when 'activities'
      config_service.validate_activities(
        data[:selected_activities] || [],
        data[:main_activity]
      )
    when 'visa_package'
      config_service.validate_visa_package(
        data[:visa_count]&.to_i || 0,
        data[:partner_visa_count]&.to_i || 0
      )
    when 'share_capital'
      config_service.validate_share_capital(
        data[:amount]&.to_f || 0,
        data[:partner_visa_count]&.to_i || 0
      )
    else
      { valid: false, errors: ['Unknown validation type'] }
    end
    
    render json: {
      data: result
    }
  end
  
  # GET /api/v1/form_configs/:freezone/business_rules
  def business_rules
    freezone_code = params[:freezone]&.upcase
    config_service = CompanyFormation::ConfigService.new(freezone_code)
    
    unless config_service.valid?
      render json: { error: 'Invalid freezone configuration' }, status: :bad_request
      return
    end
    
    render json: {
      data: config_service.business_rules
    }
  end
  
  private
  
  def validate_params
    # Add any parameter validation here
  end
end

class FormConfigValidator < BaseValidator
  def initialize(freezone_code: nil, validation_type: nil, data: {})
    @freezone_code = freezone_code
    @validation_type = validation_type
    @data = data
  end

  def validate
    @errors = []

    validate_freezone_code
    validate_validation_type
    validate_data if @validation_type

    errors
  end

  private

  def validate_freezone_code
    return add_error "Freezone code is required" if @freezone_code.blank?
    return add_error "Invalid freezone code" unless valid_freezone_code?
  end

  def validate_validation_type
    valid_types = ['yaml', 'form_data', 'business_rules']
    return add_error "Validation type is required" if @validation_type.blank?
    return add_error "Invalid validation type. Valid types: #{valid_types.join(', ')}" unless valid_types.include?(@validation_type)
  end

  def validate_data
    case @validation_type
    when 'yaml'
      validate_yaml_data
    when 'form_data'
      validate_form_data
    when 'business_rules'
      validate_business_rules
    end
  end

  def validate_yaml_data
    return add_error "YAML data is required for YAML validation" if @data.blank?
    return add_error "Invalid YAML structure" unless valid_yaml_structure?
  end

  def validate_form_data
    return add_error "Form data is required for form data validation" if @data.blank?
    # Add specific form data validations here
    add_error "Form data must be a hash" unless @data.is_a?(Hash)
  end

  def validate_business_rules
    return add_error "Business rules data is required for business rules validation" if @data.blank?
    # Add specific business rule validations here
    add_error "Business rules must be an array" unless @data.is_a?(Array)
  end

  def valid_freezone_code?
    # This would typically check against a list of valid freezone codes
    # For now, just check it's a non-empty string
    @freezone_code.is_a?(String) && @freezone_code.length > 0
  end

  def valid_yaml_structure?
    # This would validate the YAML structure
    # For now, just check it's a hash
    @data.is_a?(Hash)
  end
end

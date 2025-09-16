module Workflow
  class FormConfigParser < YamlParser
    # Extends the existing YamlParser to handle form-specific configurations
    # This maintains compatibility while adding form capabilities
    
    def freezone_info
      @config['freezone'] || {}
    end
    
    def freezone_code
      freezone_info['code']
    end
    
    def freezone_name
      freezone_info['name']
    end
    
    def freezone_tagline
      freezone_info['tagline']
    end
    
    def business_rules
      @config['business_rules'] || {}
    end
    
    def form_steps
      @config['steps'] || []
    end
    
    def form_components
      @config['components'] || {}
    end
    
    def validation_rules
      @config['validation_rules'] || {}
    end
    
    def banned_words
      validation_rules['banned_words'] || {}
    end
    
    def name_restrictions
      validation_rules['name_restrictions'] || {}
    end
    
    def file_upload_rules
      validation_rules['file_upload'] || {}
    end
    
    def internal_fields
      @config['internal_fields'] || []
    end
    
    def application_states
      @config['application_states'] || []
    end
    
    # Business rule helpers for easy access
    def free_activities_count
      business_rules.dig('activities', 'free_activities_count') || 3
    end
    
    def max_activities_count
      business_rules.dig('activities', 'max_activities_count') || 10
    end
    
    def min_share_capital
      business_rules.dig('share_capital', 'min_amount') || 1000
    end
    
    def max_share_capital_without_bank_letter
      business_rules.dig('share_capital', 'max_without_bank_letter') || 150000
    end
    
    def partner_visa_capital_multiplier
      business_rules.dig('share_capital', 'partner_visa_capital_multiplier') || 48000
    end
    
    def min_visa_package
      business_rules.dig('visas', 'min_package') || 1
    end
    
    def max_visa_package
      business_rules.dig('visas', 'max_package') || 9
    end
    
    def establishment_card_required_when_visas?
      business_rules.dig('visas', 'establishment_card_required_when_visas') == true
    end
    
    # Component helpers
    def component_config(component_name)
      form_components[component_name.to_s] || {}
    end
    
    def step_config(step_id)
      form_steps.find { |step| step['id'] == step_id.to_s } || {}
    end
    
    def step_component(step_id)
      step_config(step_id)['component']
    end
    
    def step_title(step_id)
      step_config(step_id)['title']
    end
    
    def step_subtitle(step_id)
      step_config(step_id)['subtitle']
    end
    
    def step_icon(step_id)
      step_config(step_id)['icon']
    end
    
    # Validation helpers
    def validate_company_name(name)
      return { valid: false, errors: ['Name is required'] } if name.blank?
      
      errors = []
      
      # Check banned tokens
      banned_tokens = banned_words['tokens'] || []
      case_sensitive = banned_words['case_sensitive'] != false
      
      name_to_check = case_sensitive ? name : name.downcase
      banned_tokens.each do |token|
        token_to_check = case_sensitive ? token : token.downcase
        if name_to_check.include?(token_to_check)
          errors << "Name cannot contain '#{token}'"
        end
      end
      
      # Check single word length
      min_length = name_restrictions['single_word_min_length'] || 2
      words = name.strip.split(/\s+/)
      if words.length == 1 && words.first.length < min_length
        errors << "Single word names must be at least #{min_length} characters"
      end
      
      { valid: errors.empty?, errors: errors }
    end
    
    def validate_activities_selection(selected_activities, main_activity)
      errors = []
      
      errors << 'At least one activity must be selected' if selected_activities.empty?
      errors << 'Main activity must be selected' if main_activity.blank?
      errors << 'Main activity must be one of the selected activities' if main_activity.present? && !selected_activities.include?(main_activity)
      
      max_activities = max_activities_count
      if selected_activities.length > max_activities
        errors << "Maximum #{max_activities} activities allowed"
      end
      
      { valid: errors.empty?, errors: errors }
    end
    
    def validate_visa_package(visa_count, partner_visa_count = 0)
      errors = []
      
      min_visas = min_visa_package
      max_visas = max_visa_package
      
      errors << "Minimum #{min_visas} visa required" if visa_count < min_visas
      errors << "Maximum #{max_visas} visas allowed" if visa_count > max_visas
      errors << "Partner visa count cannot exceed total visa package" if partner_visa_count > visa_count
      
      { valid: errors.empty?, errors: errors }
    end
    
    def validate_share_capital(amount, partner_visa_count = 0)
      errors = []
      
      min_capital = min_share_capital
      errors << "Minimum share capital is #{min_capital} AED" if amount < min_capital
      
      if partner_visa_count > 0
        required_capital = partner_visa_count * partner_visa_capital_multiplier
        if amount < required_capital
          errors << "Partner visas require minimum #{required_capital} AED share capital (#{partner_visa_capital_multiplier} AED per visa)"
        end
      end
      
      { valid: errors.empty?, errors: errors, requires_bank_letter: amount > max_share_capital_without_bank_letter }
    end
    
    # Convert to API-friendly format
    def to_api_json
      {
        freezone: {
          code: freezone_code,
          name: freezone_name,
          tagline: freezone_tagline
        },
        steps: form_steps,
        components: form_components,
        business_rules: {
          activities: {
            free_count: free_activities_count,
            max_count: max_activities_count
          },
          share_capital: {
            min_amount: min_share_capital,
            max_without_bank_letter: max_share_capital_without_bank_letter,
            partner_visa_multiplier: partner_visa_capital_multiplier
          },
          visas: {
            min_package: min_visa_package,
            max_package: max_visa_package,
            establishment_card_required: establishment_card_required_when_visas?
          }
        },
        validation_rules: validation_rules,
        internal_fields: internal_fields
      }
    end
    
    private
    
    def validate_config!
      super # Call parent validation
      
      # Add form-specific validations
      errors = []
      
      errors << "Missing freezone configuration" unless freezone_info.present?
      errors << "Missing freezone code" unless freezone_code.present?
      errors << "Missing form steps" if form_steps.empty?
      
      # Validate step structure
      form_steps.each_with_index do |step, index|
        errors << "Step #{index + 1}: missing id" unless step['id'].present?
        errors << "Step #{index + 1}: missing title" unless step['title'].present?
        errors << "Step #{index + 1}: missing component" unless step['component'].present?
      end
      
      raise ArgumentError, "Invalid form configuration: #{errors.join(', ')}" if errors.any?
    end
  end
end

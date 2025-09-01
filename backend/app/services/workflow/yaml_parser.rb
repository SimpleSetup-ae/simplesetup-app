module Workflow
  class YamlParser
    attr_reader :config, :workflow_type, :steps
    
    def initialize(workflow_file)
      @config = YAML.load_file(workflow_file)
      @workflow_type = @config['workflow_type']
      @steps = @config['steps'] || []
      validate_config!
    end
    
    def self.load_workflow(workflow_type)
      workflow_file = Rails.root.join("config/workflows/#{workflow_type}.yml")
      raise ArgumentError, "Workflow file not found: #{workflow_file}" unless File.exist?(workflow_file)
      
      new(workflow_file)
    end
    
    def name
      @config['name']
    end
    
    def description
      @config['description']
    end
    
    def version
      @config['version']
    end
    
    def free_zone
      @config['free_zone']
    end
    
    def metadata
      @config['metadata'] || {}
    end
    
    def estimated_duration_days
      metadata['estimated_duration_days']
    end
    
    def required_documents
      metadata['required_documents'] || []
    end
    
    def fees
      metadata['fees'] || {}
    end
    
    def validation_rules
      @config['validation'] || {}
    end
    
    def automation_settings
      @config['automation'] || {}
    end
    
    def notification_settings
      @config['notifications'] || {}
    end
    
    def step_by_number(step_number)
      steps.find { |step| step['step_number'] == step_number }
    end
    
    def total_steps
      steps.count
    end
    
    def step_types
      steps.map { |step| step['step_type'] }.uniq
    end
    
    def required_step_numbers
      steps.select { |step| step['required'] }.map { |step| step['step_number'] }
    end
    
    def automation_enabled?
      automation_settings['enabled'] == true
    end
    
    def fallback_to_manual?
      automation_settings['fallback_to_manual'] == true
    end
    
    def validate_step_data(step_number, data)
      step_config = step_by_number(step_number)
      return { valid: false, errors: ['Step not found'] } unless step_config
      
      validator = StepValidator.new(step_config)
      validator.validate(data)
    end
    
    private
    
    def validate_config!
      errors = []
      
      errors << "Missing workflow_type" unless @config['workflow_type'].present?
      errors << "Missing name" unless @config['name'].present?
      errors << "Missing steps" if steps.empty?
      
      # Validate step numbers are sequential
      step_numbers = steps.map { |step| step['step_number'] }.sort
      expected_numbers = (1..step_numbers.max).to_a
      errors << "Step numbers must be sequential" unless step_numbers == expected_numbers
      
      # Validate required step fields
      steps.each_with_index do |step, index|
        step_errors = validate_step_config(step, index + 1)
        errors.concat(step_errors)
      end
      
      raise ArgumentError, "Invalid workflow configuration: #{errors.join(', ')}" if errors.any?
    end
    
    def validate_step_config(step, position)
      errors = []
      
      errors << "Step #{position}: missing step_number" unless step['step_number'].present?
      errors << "Step #{position}: missing step_type" unless step['step_type'].present?
      errors << "Step #{position}: missing title" unless step['title'].present?
      
      valid_step_types = %w[FORM DOC_UPLOAD AUTO REVIEW PAYMENT ISSUANCE NOTIFY]
      unless valid_step_types.include?(step['step_type'])
        errors << "Step #{position}: invalid step_type '#{step['step_type']}'"
      end
      
      errors
    end
  end
end

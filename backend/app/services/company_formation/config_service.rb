module CompanyFormation
  class ConfigService
    include ActiveModel::Model
    
    attr_reader :freezone_code, :config_parser
    
    def initialize(freezone_code)
      @freezone_code = freezone_code&.upcase
      load_config
    end
    
    def self.available_freezones
      Dir.glob(Rails.root.join('config/workflows/*_company_formation_form.yml')).map do |file|
        filename = File.basename(file, '_company_formation_form.yml')
        filename.upcase
      end
    end
    
    def self.default_freezone
      'IFZA'
    end
    
    def valid?
      @config_parser.present?
    rescue => e
      Rails.logger.error "Invalid freezone config for #{@freezone_code}: #{e.message}"
      false
    end
    
    def config
      return {} unless valid?
      @config_parser.to_api_json
    end
    
    def freezone_info
      return {} unless valid?
      config[:freezone]
    end
    
    def steps
      return [] unless valid?
      config[:steps]
    end
    
    def components
      return {} unless valid?
      config[:components]
    end
    
    def business_rules
      return {} unless valid?
      config[:business_rules]
    end
    
    def validation_rules
      return {} unless valid?
      config[:validation_rules]
    end
    
    # Validation methods that can be called from API
    def validate_company_name(name)
      return { valid: false, errors: ['Configuration not loaded'] } unless valid?
      @config_parser.validate_company_name(name)
    end
    
    def validate_activities(selected_activities, main_activity)
      return { valid: false, errors: ['Configuration not loaded'] } unless valid?
      @config_parser.validate_activities_selection(selected_activities, main_activity)
    end
    
    def validate_visa_package(visa_count, partner_visa_count = 0)
      return { valid: false, errors: ['Configuration not loaded'] } unless valid?
      @config_parser.validate_visa_package(visa_count, partner_visa_count)
    end
    
    def validate_share_capital(amount, partner_visa_count = 0)
      return { valid: false, errors: ['Configuration not loaded'] } unless valid?
      @config_parser.validate_share_capital(amount, partner_visa_count)
    end
    
    # Business rule helpers
    def free_activities_count
      return 3 unless valid?
      @config_parser.free_activities_count
    end
    
    def max_activities_count
      return 10 unless valid?
      @config_parser.max_activities_count
    end
    
    def requires_bank_letter?(share_capital_amount)
      return false unless valid?
      share_capital_amount > @config_parser.max_share_capital_without_bank_letter
    end
    
    def partner_visa_capital_requirement(partner_visa_count)
      return 0 unless valid?
      partner_visa_count * @config_parser.partner_visa_capital_multiplier
    end
    
    # API response format
    def to_json
      {
        freezone: freezone_info,
        steps: steps,
        components: components,
        business_rules: business_rules,
        validation_rules: validation_rules,
        meta: {
          loaded_at: Time.current.iso8601,
          version: config_version
        }
      }
    end
    
    def as_json(options = {})
      to_json
    end
    
    private
    
    def load_config
      return unless @freezone_code.present?
      
      config_file = config_file_path
      return unless File.exist?(config_file)
      
      @config_parser = Workflow::FormConfigParser.new(config_file)
    rescue => e
      Rails.logger.error "Failed to load config for #{@freezone_code}: #{e.message}"
      @config_parser = nil
    end
    
    def config_file_path
      Rails.root.join("config/workflows/#{@freezone_code.downcase}_company_formation_form.yml")
    end
    
    def config_version
      return 'unknown' unless valid?
      
      file_path = config_file_path
      return 'unknown' unless File.exist?(file_path)
      
      File.mtime(file_path).to_i.to_s
    end
  end
end

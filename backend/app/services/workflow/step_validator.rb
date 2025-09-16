module Workflow
  class StepValidator
    attr_reader :step_config
    
    def initialize(step_config)
      @step_config = step_config
    end
    
    def validate(data)
      errors = []
      
      case step_config['step_type']
      when 'FORM'
        errors.concat(validate_form_data(data))
      when 'DOC_UPLOAD'
        errors.concat(validate_document_data(data))
      when 'PAYMENT'
        errors.concat(validate_payment_data(data))
      end
      
      {
        valid: errors.empty?,
        errors: errors,
        data: data
      }
    end
    
    private
    
    def validate_form_data(data)
      errors = []
      fields = step_config['fields'] || []
      
      fields.each do |field|
        field_name = field['name']
        field_value = data[field_name]
        
        # Check required fields
        if field['required'] && (field_value.nil? || field_value.to_s.strip.empty?)
          errors << "#{field['label'] || field_name} is required"
          next
        end
        
        next if field_value.nil? || field_value.to_s.strip.empty?
        
        # Validate field type
        case field['type']
        when 'text'
          errors.concat(validate_text_field(field, field_value))
        when 'textarea'
          errors.concat(validate_textarea_field(field, field_value))
        when 'number'
          errors.concat(validate_number_field(field, field_value))
        when 'select'
          errors.concat(validate_select_field(field, field_value))
        when 'array'
          errors.concat(validate_array_field(field, field_value))
        end
      end
      
      errors
    end
    
    def validate_document_data(data)
      errors = []
      requirements = step_config['document_requirements'] || []
      uploaded_docs = data['documents'] || []
      
      requirements.each do |req|
        if req['required']
          matching_docs = uploaded_docs.select { |doc| doc['type'] == req['type'] }
          if matching_docs.empty?
            errors << "#{req['title']} is required"
          end
        end
      end
      
      # Validate uploaded documents
      uploaded_docs.each do |doc|
        req = requirements.find { |r| r['type'] == doc['type'] }
        next unless req
        
        # Check file size
        if req['max_size_mb'] && doc['size_mb'] > req['max_size_mb']
          errors << "#{req['title']}: file size exceeds #{req['max_size_mb']}MB limit"
        end
        
        # Check file format
        if req['accepted_formats'] && !req['accepted_formats'].include?(doc['format']&.upcase)
          errors << "#{req['title']}: unsupported file format. Accepted: #{req['accepted_formats'].join(', ')}"
        end
      end
      
      errors
    end
    
    def validate_payment_data(data)
      errors = []
      payment_items = step_config['payment_items'] || []
      
      payment_items.each do |item|
        if item['required'] != false
          payment_key = item['name'].downcase.gsub(' ', '_')
          unless data[payment_key] || data['total_amount']
            errors << "Payment for #{item['name']} is required"
          end
        end
      end
      
      errors
    end
    
    def validate_text_field(field, value)
      errors = []
      validation = field['validation'] || {}
      
      if validation['min_length'] && value.length < validation['min_length']
        errors << "#{field['label']} must be at least #{validation['min_length']} characters"
      end
      
      if validation['max_length'] && value.length > validation['max_length']
        errors << "#{field['label']} must not exceed #{validation['max_length']} characters"
      end
      
      if validation['pattern']
        regex = Regexp.new(validation['pattern'])
        unless value.match?(regex)
          errors << "#{field['label']} format is invalid"
        end
      end
      
      errors
    end
    
    def validate_textarea_field(field, value)
      validate_text_field(field, value)
    end
    
    def validate_number_field(field, value)
      errors = []
      validation = field['validation'] || {}
      
      begin
        num_value = Float(value)
        
        if validation['min'] && num_value < validation['min']
          errors << "#{field['label']} must be at least #{validation['min']}"
        end
        
        if validation['max'] && num_value > validation['max']
          errors << "#{field['label']} must not exceed #{validation['max']}"
        end
      rescue ArgumentError
        errors << "#{field['label']} must be a valid number"
      end
      
      errors
    end
    
    def validate_select_field(field, value)
      errors = []
      options = field['options']
      
      if options.is_a?(Array) && !options.include?(value)
        errors << "#{field['label']} must be one of: #{options.join(', ')}"
      end
      
      errors
    end
    
    def validate_array_field(field, value)
      errors = []
      
      unless value.is_a?(Array)
        errors << "#{field['label']} must be an array"
        return errors
      end
      
      if field['min_items'] && value.length < field['min_items']
        errors << "#{field['label']} must have at least #{field['min_items']} items"
      end
      
      if field['max_items'] && value.length > field['max_items']
        errors << "#{field['label']} must not exceed #{field['max_items']} items"
      end
      
      # Validate individual items if schema is provided
      if field['item_schema']
        value.each_with_index do |item, index|
          field['item_schema'].each do |item_field|
            item_field_name = item_field['name']
            item_value = item[item_field_name]
            
            if item_field['required'] && (item_value.nil? || item_value.to_s.strip.empty?)
              errors << "#{field['label']} item #{index + 1}: #{item_field['name']} is required"
            end
          end
        end
      end
      
      errors
    end
  end
end

module Workflow
  module StepHandlers
    class FormHandler
      attr_reader :workflow_step, :step_config
      
      def initialize(workflow_step)
        @workflow_step = workflow_step
        @step_config = workflow_step.data
      end
      
      def render_form
        {
          step_number: workflow_step.step_number,
          title: workflow_step.title,
          description: workflow_step.description,
          fields: process_fields(step_config['fields'] || []),
          validation_rules: workflow_step.validation_rules
        }
      end
      
      def process_submission(form_data)
        # Validate the form data
        validator = Workflow::StepValidator.new(step_config)
        validation_result = validator.validate(form_data)
        
        unless validation_result[:valid]
          return {
            success: false,
            errors: validation_result[:errors]
          }
        end
        
        # Process specific form logic
        processed_data = process_form_data(validation_result[:data])
        
        # Update workflow instance form_data
        workflow_instance = workflow_step.workflow_instance
        workflow_instance.update!(
          form_data: workflow_instance.form_data.merge(
            "step_#{workflow_step.step_number}" => processed_data
          )
        )
        
        {
          success: true,
          data: processed_data,
          next_action: determine_next_action
        }
      end
      
      private
      
      def process_fields(fields)
        fields.map do |field|
          processed_field = field.dup
          
          # Process dynamic options
          if field['options'] == 'countries'
            processed_field['options'] = load_country_options
          end
          
          # Add any field-specific processing
          case field['type']
          when 'array'
            processed_field['item_schema'] = process_fields(field['item_schema'] || [])
          end
          
          processed_field
        end
      end
      
      def process_form_data(data)
        processed = data.dup
        
        # Handle special field types
        step_config['fields']&.each do |field|
          field_name = field['name']
          next unless data[field_name]
          
          case field['type']
          when 'array'
            if field_name == 'shareholders'
              processed[field_name] = process_shareholders(data[field_name])
            elsif field_name == 'directors'
              processed[field_name] = process_directors(data[field_name])
            end
          end
        end
        
        processed
      end
      
      def process_shareholders(shareholders_data)
        shareholders_data.map.with_index do |shareholder, index|
          processed = shareholder.dup
          processed['id'] = SecureRandom.uuid
          processed['type'] = 'shareholder'
          processed['order'] = index + 1
          processed
        end
      end
      
      def process_directors(directors_data)
        directors_data.map.with_index do |director, index|
          processed = director.dup
          processed['id'] = SecureRandom.uuid
          processed['type'] = 'director'
          processed['order'] = index + 1
          processed
        end
      end
      
      def load_country_options
        # This would typically load from a countries reference table
        # For now, return a subset of common countries
        [
          'United Arab Emirates',
          'United States',
          'United Kingdom',
          'India',
          'Pakistan',
          'Philippines',
          'Egypt',
          'Jordan',
          'Lebanon',
          'Syria',
          'Bangladesh',
          'Sri Lanka',
          'Nepal',
          'Canada',
          'Australia',
          'Germany',
          'France',
          'Italy',
          'Spain',
          'Netherlands',
          'Sweden',
          'Norway',
          'Denmark',
          'South Africa',
          'Nigeria',
          'Kenya',
          'Ethiopia'
        ].sort
      end
      
      def determine_next_action
        # Determine what should happen after this form is submitted
        case workflow_step.step_number
        when 1
          'proceed_to_next_step'
        when 2
          'proceed_to_documents'
        else
          'proceed_to_next_step'
        end
      end
    end
  end
end

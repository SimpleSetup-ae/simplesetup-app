class WorkflowService
  class << self
    def start_formation_workflow(company)
      # Determine workflow type based on free zone
      workflow_type = "#{company.free_zone.downcase}_company_formation"
      
      # Load workflow configuration
      parser = Workflow::YamlParser.load_workflow(workflow_type)
      
      # Create workflow instance
      workflow_instance = company.workflow_instances.create!(
        workflow_type: workflow_type,
        status: 'pending',
        metadata: {
          workflow_name: parser.name,
          version: parser.version,
          free_zone: parser.free_zone,
          estimated_duration_days: parser.estimated_duration_days
        }
      )
      
      # Create workflow steps
      parser.steps.each do |step_config|
        workflow_instance.workflow_steps.create!(
          step_number: step_config['step_number'],
          step_type: step_config['step_type'],
          title: step_config['title'],
          description: step_config['description'],
          data: step_config.except('step_number', 'step_type', 'title', 'description'),
          validation_rules: extract_validation_rules(step_config)
        )
      end
      
      workflow_instance
    end
    
    def start_workflow_instance(workflow_instance)
      return false unless workflow_instance.pending?
      
      workflow_instance.start!
      
      # Start the first step if it exists
      first_step = workflow_instance.workflow_steps.find_by(step_number: 1)
      first_step&.start!
      
      # Send notification
      WorkflowNotificationJob.perform_later(workflow_instance, 'started')
      
      true
    end
    
    def complete_step(workflow_step, data = {})
      return { success: false, errors: ['Step cannot be completed'] } unless workflow_step.can_be_completed?
      
      # Validate step data
      parser = Workflow::YamlParser.load_workflow(workflow_step.workflow_instance.workflow_type)
      validation_result = parser.validate_step_data(workflow_step.step_number, data)
      
      unless validation_result[:valid]
        return { success: false, errors: validation_result[:errors] }
      end
      
      # Complete the step
      workflow_step.complete!(validation_result[:data])
      
      # Check if workflow is complete
      if workflow_complete?(workflow_step.workflow_instance)
        complete_workflow(workflow_step.workflow_instance)
      else
        # Start next step if it's not automated
        advance_workflow(workflow_step.workflow_instance)
      end
      
      { success: true, workflow_step: workflow_step }
    end
    
    def skip_step(workflow_step, reason = nil)
      return false unless workflow_step.can_be_completed?
      
      workflow_step.skip!(reason)
      advance_workflow(workflow_step.workflow_instance)
      
      true
    end
    
    def fail_step(workflow_step, error_message)
      workflow_step.fail!(error_message)
      workflow_step.workflow_instance.fail!(error_message)
      
      # Send notification
      WorkflowNotificationJob.perform_later(workflow_step.workflow_instance, 'failed', error_message)
      
      true
    end
    
    def retry_step(workflow_step)
      return false unless workflow_step.status == 'failed'
      
      workflow_step.update!(
        status: 'pending',
        error_message: nil,
        started_at: nil,
        completed_at: nil
      )
      
      workflow_step.start!
      
      true
    end
    
    def run_automation(workflow_step)
      return { success: false, error: 'Step is not automated' } unless workflow_step.is_automated?
      
      automation_config = workflow_step.data['automation']
      return { success: false, error: 'No automation configuration' } unless automation_config
      
      # Start the step
      workflow_step.start!
      
      begin
        # Run automation based on service and action
        result = case automation_config['service']
                 when 'ifza_portal'
                   run_ifza_automation(workflow_step, automation_config)
                 else
                   { success: false, error: 'Unknown automation service' }
                 end
        
        if result[:success]
          complete_step(workflow_step, result[:data] || {})
        else
          handle_automation_failure(workflow_step, result[:error])
        end
        
        result
      rescue => e
        handle_automation_failure(workflow_step, e.message)
        { success: false, error: e.message }
      end
    end
    
    def get_workflow_progress(workflow_instance)
      total_steps = workflow_instance.workflow_steps.count
      completed_steps = workflow_instance.workflow_steps.where(status: ['completed', 'skipped']).count
      
      {
        total_steps: total_steps,
        completed_steps: completed_steps,
        current_step: workflow_instance.current_step,
        progress_percentage: total_steps > 0 ? (completed_steps.to_f / total_steps * 100).round : 0,
        status: workflow_instance.status,
        current_step_instance: workflow_instance.current_step_instance
      }
    end
    
    private
    
    def extract_validation_rules(step_config)
      case step_config['step_type']
      when 'FORM'
        { fields: step_config['fields'] || [] }
      when 'DOC_UPLOAD'
        { document_requirements: step_config['document_requirements'] || [] }
      when 'PAYMENT'
        { payment_items: step_config['payment_items'] || [] }
      else
        {}
      end
    end
    
    def workflow_complete?(workflow_instance)
      required_steps = workflow_instance.workflow_steps.where(
        step_number: workflow_instance.workflow_steps.pluck(:step_number)
      )
      
      completed_or_skipped = required_steps.where(status: ['completed', 'skipped']).count
      completed_or_skipped == required_steps.count
    end
    
    def complete_workflow(workflow_instance)
      workflow_instance.complete!
      
      # Update company status
      workflow_instance.company.update!(status: 'processing')
      
      # Send completion notification
      WorkflowNotificationJob.perform_later(workflow_instance, 'completed')
      
      # Trigger any post-completion actions
      trigger_post_completion_actions(workflow_instance)
    end
    
    def advance_workflow(workflow_instance)
      current_step = workflow_instance.current_step_instance
      return unless current_step&.status == 'completed'
      
      # Find next step
      next_step = workflow_instance.workflow_steps
                                  .where('step_number > ?', workflow_instance.current_step)
                                  .order(:step_number)
                                  .first
      
      if next_step
        workflow_instance.update!(current_step: next_step.step_number)
        
        # Auto-start next step if it's automated
        if next_step.is_automated?
          AutomationJob.perform_later(next_step)
        else
          next_step.start!
          WorkflowNotificationJob.perform_later(workflow_instance, 'step_ready', next_step)
        end
      end
    end
    
    def handle_automation_failure(workflow_step, error_message)
      parser = Workflow::YamlParser.load_workflow(workflow_step.workflow_instance.workflow_type)
      
      if parser.fallback_to_manual?
        # Convert to manual step
        workflow_step.update!(
          data: workflow_step.data.merge(
            'fallback_to_manual' => true,
            'automation_error' => error_message,
            'fallback_instructions' => workflow_step.data.dig('fallback', 'instructions')
          )
        )
        
        # Assign to CSP admin
        assign_to_role(workflow_step, 'csp_admin')
        
        WorkflowNotificationJob.perform_later(
          workflow_step.workflow_instance, 
          'automation_failed_manual_required',
          workflow_step
        )
      else
        fail_step(workflow_step, error_message)
      end
    end
    
    def run_ifza_automation(workflow_step, automation_config)
      # This would integrate with the actual IFZA portal automation
      # For now, return a placeholder
      {
        success: true,
        data: {
          automation_result: 'completed',
          reference_number: "IFZA#{Time.current.to_i}",
          completed_at: Time.current.iso8601
        }
      }
    end
    
    def assign_to_role(workflow_step, role)
      # Find users with the specified role for this company
      company = workflow_step.workflow_instance.company
      assignees = company.company_memberships.where(role: role).includes(:user)
      
      if assignees.any?
        workflow_step.update!(
          data: workflow_step.data.merge(
            'assigned_to_role' => role,
            'assignee_ids' => assignees.pluck(:user_id)
          )
        )
      end
    end
    
    def trigger_post_completion_actions(workflow_instance)
      # Generate documents, send notifications, etc.
      case workflow_instance.workflow_type
      when 'ifza_company_formation'
        GenerateLicenseJob.perform_later(workflow_instance.company)
      end
    end
  end
end

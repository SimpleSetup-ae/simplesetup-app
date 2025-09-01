class RequestService
  class << self
    def get_available_request_types(company)
      base_types = [
        {
          type: 'name_change',
          title: 'Company Name Change',
          description: 'Change your company or trade name',
          fee: 1500,
          currency: 'AED',
          processing_time_days: 7,
          required_documents: ['board_resolution', 'name_reservation_certificate']
        },
        {
          type: 'shareholder_change',
          title: 'Shareholder Changes',
          description: 'Add, remove, or transfer shares between shareholders',
          fee: 2000,
          currency: 'AED',
          processing_time_days: 10,
          required_documents: ['share_transfer_agreement', 'board_resolution', 'updated_moa']
        },
        {
          type: 'activity_change',
          title: 'Business Activity Changes',
          description: 'Add or modify your company business activities',
          fee: 1000,
          currency: 'AED',
          processing_time_days: 5,
          required_documents: ['board_resolution', 'activity_description']
        },
        {
          type: 'noc_letter',
          title: 'NOC Letter Request',
          description: 'Request No Objection Certificate for various purposes',
          fee: 500,
          currency: 'AED',
          processing_time_days: 3,
          required_documents: ['purpose_letter', 'company_documents']
        }
      ]
      
      # Filter based on company status and eligibility
      base_types.select { |type| eligible_for_request_type?(company, type[:type]) }
    end
    
    def create_request_workflow(request)
      # Create a workflow for processing the request
      workflow_type = "#{request.request_type}_workflow"
      
      workflow_instance = request.company.workflow_instances.create!(
        workflow_type: workflow_type,
        status: 'pending',
        metadata: {
          request_id: request.id,
          request_type: request.request_type,
          estimated_processing_days: get_processing_time(request.request_type)
        }
      )
      
      # Create workflow steps based on request type
      create_request_workflow_steps(workflow_instance, request)
      
      workflow_instance
    end
    
    def process_request_approval(request)
      case request.request_type
      when 'name_change'
        process_name_change_approval(request)
      when 'shareholder_change'
        process_shareholder_change_approval(request)
      when 'activity_change'
        process_activity_change_approval(request)
      when 'noc_letter'
        process_noc_letter_approval(request)
      end
    end
    
    def get_request_form_schema(request_type)
      case request_type
      when 'name_change'
        {
          fields: [
            {
              name: 'new_company_name',
              type: 'text',
              label: 'New Company Name',
              required: true,
              validation: { min_length: 3, max_length: 100 }
            },
            {
              name: 'new_trade_name',
              type: 'text',
              label: 'New Trade Name (if different)',
              required: false
            },
            {
              name: 'reason_for_change',
              type: 'textarea',
              label: 'Reason for Name Change',
              required: true,
              validation: { min_length: 20 }
            }
          ]
        }
      when 'shareholder_change'
        {
          fields: [
            {
              name: 'change_type',
              type: 'select',
              label: 'Type of Change',
              required: true,
              options: ['add_shareholder', 'remove_shareholder', 'transfer_shares', 'update_shareholding']
            },
            {
              name: 'shareholders_data',
              type: 'array',
              label: 'Shareholder Changes',
              required: true,
              item_schema: [
                { name: 'action', type: 'select', options: ['add', 'remove', 'update'] },
                { name: 'full_name', type: 'text', required: true },
                { name: 'nationality', type: 'text', required: true },
                { name: 'passport_number', type: 'text', required: true },
                { name: 'new_share_percentage', type: 'number', min: 0, max: 100 }
              ]
            }
          ]
        }
      when 'activity_change'
        {
          fields: [
            {
              name: 'new_activities',
              type: 'array',
              label: 'New Business Activities',
              required: true,
              item_schema: [
                { name: 'activity_code', type: 'text', required: true },
                { name: 'activity_description', type: 'textarea', required: true }
              ]
            },
            {
              name: 'reason_for_change',
              type: 'textarea',
              label: 'Reason for Activity Change',
              required: true
            }
          ]
        }
      when 'noc_letter'
        {
          fields: [
            {
              name: 'noc_purpose',
              type: 'select',
              label: 'Purpose of NOC',
              required: true,
              options: ['bank_account', 'visa_application', 'contract_signing', 'other']
            },
            {
              name: 'purpose_details',
              type: 'textarea',
              label: 'Detailed Purpose',
              required: true
            },
            {
              name: 'recipient_name',
              type: 'text',
              label: 'NOC Recipient Name',
              required: true
            },
            {
              name: 'recipient_organization',
              type: 'text',
              label: 'Recipient Organization',
              required: false
            }
          ]
        }
      else
        { fields: [] }
      end
    end
    
    private
    
    def eligible_for_request_type?(company, request_type)
      # Only issued companies can make most requests
      return false unless company.status == 'issued'
      
      case request_type
      when 'noc_letter'
        # NOC letters can be requested for active companies
        %w[approved issued].include?(company.status)
      else
        company.status == 'issued'
      end
    end
    
    def get_processing_time(request_type)
      processing_times = {
        'name_change' => 7,
        'shareholder_change' => 10,
        'activity_change' => 5,
        'noc_letter' => 3
      }
      
      processing_times[request_type] || 7
    end
    
    def create_request_workflow_steps(workflow_instance, request)
      # Standard request processing workflow
      steps = [
        {
          step_number: 1,
          step_type: 'REVIEW',
          title: 'Initial Review',
          description: 'CSP team reviews the request and documents',
          data: { assignee_role: 'csp_admin', auto_assign: true }
        },
        {
          step_number: 2,
          step_type: 'PAYMENT',
          title: 'Fee Payment',
          description: 'Process request processing fee',
          data: { 
            payment_items: [
              {
                name: "#{request.request_type.humanize} Fee",
                amount: request.fee_amount || 1000,
                currency: request.fee_currency || 'AED',
                type: 'service'
              }
            ]
          }
        },
        {
          step_number: 3,
          step_type: 'AUTO',
          title: 'Authority Submission',
          description: 'Submit request to relevant authorities',
          data: { 
            automation: {
              service: 'authority_portal',
              action: 'submit_amendment',
              fallback: { type: 'manual', assignee_role: 'csp_admin' }
            }
          }
        },
        {
          step_number: 4,
          step_type: 'NOTIFY',
          title: 'Completion Notification',
          description: 'Notify client of request completion',
          data: {
            notifications: [
              { type: 'email', template: 'request_completed' }
            ]
          }
        }
      ]
      
      steps.each do |step_config|
        workflow_instance.workflow_steps.create!(
          step_number: step_config[:step_number],
          step_type: step_config[:step_type],
          title: step_config[:title],
          description: step_config[:description],
          data: step_config[:data]
        )
      end
    end
    
    def process_name_change_approval(request)
      # Update company name in the system
      new_name = request.request_data['new_company_name']
      new_trade_name = request.request_data['new_trade_name']
      
      request.company.update!(
        name: new_name,
        trade_name: new_trade_name
      ) if new_name.present?
      
      # Create workflow for processing with authorities
      create_request_workflow(request)
    end
    
    def process_shareholder_change_approval(request)
      # Process shareholder changes
      shareholders_data = request.request_data['shareholders_data'] || []
      
      shareholders_data.each do |change|
        case change['action']
        when 'add'
          request.company.people.create!(
            type: 'shareholder',
            first_name: change['full_name'].split(' ').first,
            last_name: change['full_name'].split(' ')[1..].join(' '),
            nationality: change['nationality'],
            passport_number: change['passport_number'],
            share_percentage: change['new_share_percentage']
          )
        when 'remove'
          shareholder = request.company.people.shareholders
                               .find_by(passport_number: change['passport_number'])
          shareholder&.destroy
        when 'update'
          shareholder = request.company.people.shareholders
                               .find_by(passport_number: change['passport_number'])
          shareholder&.update!(share_percentage: change['new_share_percentage'])
        end
      end
      
      create_request_workflow(request)
    end
    
    def process_activity_change_approval(request)
      # Update company activities
      new_activities = request.request_data['new_activities'] || []
      activity_codes = new_activities.map { |activity| activity['activity_code'] }
      
      request.company.update!(activity_codes: activity_codes)
      
      create_request_workflow(request)
    end
    
    def process_noc_letter_approval(request)
      # Generate NOC letter
      GenerateNocLetterJob.perform_later(request)
      
      # Mark as completed since NOC letters are generated internally
      request.complete!
    end
  end
end

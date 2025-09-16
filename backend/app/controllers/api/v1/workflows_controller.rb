class Api::V1::WorkflowsController < ApplicationController
  before_action :set_company, only: [:start]
  before_action :set_workflow_step, only: [:complete, :run_automation]
  before_action :authorize_workflow_access
  
  def start
    existing_workflow = @company.workflow_instances
                                .where(workflow_type: 'company_formation')
                                .where.not(status: ['completed', 'cancelled'])
                                .first
    
    if existing_workflow
      return render json: {
        success: false,
        error: 'Workflow already in progress',
        data: serialize_workflow_instance(existing_workflow)
      }, status: :unprocessable_entity
    end
    
    begin
      workflow_instance = WorkflowService.start_formation_workflow(@company)
      WorkflowService.start_workflow_instance(workflow_instance)
      
      render json: {
        success: true,
        data: serialize_workflow_instance_detailed(workflow_instance),
        message: 'Workflow started successfully'
      }, status: :created
    rescue => e
      Rails.logger.error "Failed to start workflow: #{e.message}"
      render json: {
        success: false,
        error: 'Failed to start workflow',
        details: e.message
      }, status: :internal_server_error
    end
  end
  
  def complete
    step_data = params[:step_data] || {}
    
    result = WorkflowService.complete_step(@workflow_step, step_data)
    
    if result[:success]
      render json: {
        success: true,
        data: {
          workflow_step: serialize_workflow_step(@workflow_step.reload),
          workflow_progress: WorkflowService.get_workflow_progress(@workflow_step.workflow_instance)
        },
        message: 'Step completed successfully'
      }
    else
      render json: {
        success: false,
        errors: result[:errors]
      }, status: :unprocessable_entity
    end
  end
  
  def run_automation
    unless @workflow_step.is_automated?
      return render json: {
        success: false,
        error: 'Step is not automated'
      }, status: :unprocessable_entity
    end
    
    # Queue automation job
    AutomationJob.perform_later(@workflow_step)
    
    render json: {
      success: true,
      data: {
        workflow_step: serialize_workflow_step(@workflow_step),
        message: 'Automation queued for execution'
      }
    }
  end
  
  private
  
  def set_company
    @company = current_user.companies.find(params[:company_id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found or access denied'
    }, status: :not_found
  end
  
  def set_workflow_step
    @workflow_step = WorkflowStep.find(params[:id])
    @company = @workflow_step.workflow_instance.company
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Workflow step not found'
    }, status: :not_found
  end
  
  def authorize_workflow_access
    unless @company.can_be_accessed_by?(current_user)
      render json: {
        success: false,
        error: 'Access denied'
      }, status: :forbidden
    end
  end
  
  def serialize_workflow_instance(workflow_instance)
    {
      id: workflow_instance.id,
      workflow_type: workflow_instance.workflow_type,
      status: workflow_instance.status,
      current_step: workflow_instance.current_step,
      progress_percentage: workflow_instance.progress_percentage,
      metadata: workflow_instance.metadata,
      started_at: workflow_instance.started_at&.iso8601,
      completed_at: workflow_instance.completed_at&.iso8601
    }
  end
  
  def serialize_workflow_instance_detailed(workflow_instance)
    base_data = serialize_workflow_instance(workflow_instance)
    
    base_data.merge({
      form_data: workflow_instance.form_data,
      steps: workflow_instance.workflow_steps.order(:step_number).map do |step|
        serialize_workflow_step(step)
      end
    })
  end
  
  def serialize_workflow_step(workflow_step)
    {
      id: workflow_step.id,
      step_number: workflow_step.step_number,
      step_type: workflow_step.step_type,
      title: workflow_step.title,
      description: workflow_step.description,
      status: workflow_step.status,
      data: workflow_step.data,
      validation_rules: workflow_step.validation_rules,
      started_at: workflow_step.started_at&.iso8601,
      completed_at: workflow_step.completed_at&.iso8601,
      error_message: workflow_step.error_message
    }
  end
end

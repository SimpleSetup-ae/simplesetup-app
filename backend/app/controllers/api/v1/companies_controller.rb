class Api::V1::CompaniesController < ApplicationController
  before_action :set_company, only: [:show, :update, :workflow]
  before_action :authorize_company_access, only: [:show, :update, :workflow]
  
  def index
    @companies = current_user.companies
                             .includes(:owner, :workflow_instances, :documents)
                             .order(created_at: :desc)
    
    render json: {
      success: true,
      data: @companies.map { |company| serialize_company(company) },
      pagination: pagination_meta(@companies)
    }
  end
  
  def show
    render json: {
      success: true,
      data: serialize_company_detailed(@company)
    }
  end
  
  def create
    @company = current_user.owned_companies.build(company_params)
    
    if @company.save
      # Create company membership for the owner
      @company.company_memberships.create!(
        user: current_user,
        role: 'owner',
        accepted_at: Time.current
      )
      
      render json: {
        success: true,
        data: serialize_company_detailed(@company),
        message: 'Company created successfully'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @company.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def update
    if @company.update(company_params)
      render json: {
        success: true,
        data: serialize_company_detailed(@company),
        message: 'Company updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @company.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def workflow
    workflow_instance = @company.current_workflow
    
    unless workflow_instance
      return render json: {
        success: false,
        error: 'No active workflow found'
      }, status: :not_found
    end
    
    progress = WorkflowService.get_workflow_progress(workflow_instance)
    
    render json: {
      success: true,
      data: {
        workflow_instance: serialize_workflow_instance(workflow_instance),
        progress: progress,
        current_step: progress[:current_step_instance] ? 
                      serialize_workflow_step(progress[:current_step_instance]) : nil
      }
    }
  end
  
  private
  
  def set_company
    @company = Company.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found'
    }, status: :not_found
  end
  
  def authorize_company_access
    unless @company.can_be_accessed_by?(current_user)
      render json: {
        success: false,
        error: 'Access denied'
      }, status: :forbidden
    end
  end
  
  def company_params
    params.require(:company).permit(
      :name, :trade_name, :free_zone, 
      activity_codes: []
    )
  end
  
  def serialize_company(company)
    {
      id: company.id,
      name: company.name,
      trade_name: company.trade_name,
      free_zone: company.free_zone,
      status: company.status,
      license_number: company.license_number,
      formation_progress: company.formation_progress,
      created_at: company.created_at.iso8601,
      updated_at: company.updated_at.iso8601,
      owner: {
        id: company.owner.id,
        name: company.owner.full_name,
        email: company.owner.email
      }
    }
  end
  
  def serialize_company_detailed(company)
    base_data = serialize_company(company)
    
    base_data.merge({
      activity_codes: company.activity_codes,
      metadata: company.metadata,
      members_count: company.company_memberships.accepted.count,
      documents_count: company.documents.count,
      current_workflow: company.current_workflow ? 
                        serialize_workflow_instance(company.current_workflow) : nil
    })
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
      completed_at: workflow_instance.completed_at&.iso8601,
      steps_count: workflow_instance.workflow_steps.count
    }
  end
  
  def serialize_workflow_step(workflow_step)
    {
      id: workflow_step.id,
      step_number: workflow_step.step_number,
      step_type: workflow_step.step_type,
      title: workflow_step.title,
      description: workflow_step.description,
      status: workflow_step.status,
      started_at: workflow_step.started_at&.iso8601,
      completed_at: workflow_step.completed_at&.iso8601,
      error_message: workflow_step.error_message
    }
  end
  
  def pagination_meta(collection)
    # Basic pagination - would be enhanced with actual pagination gem
    {
      total: collection.count,
      page: 1,
      per_page: 50
    }
  end
end

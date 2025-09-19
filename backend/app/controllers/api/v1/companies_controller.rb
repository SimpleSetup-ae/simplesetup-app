class Api::V1::CompaniesController < ApplicationController
  before_action :set_company, only: [:show, :update, :workflow, :auto_save, :update_form_data, :merge_auto_save, :form_state, :update_owner_details]
  before_action :authorize_company_access, only: [:show, :update, :workflow, :auto_save, :update_form_data, :merge_auto_save, :form_state, :update_owner_details]
  before_action :authorize_owner_access, only: [:update_owner_details]
  
  def index
    if current_user&.admin?
      # Admin view - all companies
      @companies = Company.where(status: ['formed', 'active', 'issued'])
                          .includes(:owner, :workflow_instances, :documents, :shareholders, :directors)
                          .order(created_at: :desc)
    else
      # Regular user view - only their companies
      @companies = current_user.companies
                               .includes(:owner, :workflow_instances, :documents)
                               .order(created_at: :desc)
    end
    
    render json: {
      success: true,
      data: @companies.map { |company| 
        current_user&.admin? ? serialize_admin_company(company) : serialize_company(company) 
      },
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

  # PATCH /api/v1/companies/:id/auto_save
  def auto_save
    step_data = params[:step_data] || {}
    step_name = params[:step_name]
    
    begin
      @company.auto_save_form_data!(step_data, step_name)
      
      render json: {
        success: true,
        data: {
          auto_saved: true,
          last_auto_save_at: @company.last_auto_save_at,
          form_completion_percentage: @company.form_completion_percentage,
          current_step: @company.formation_step
        }
      }
    rescue => e
      render json: { 
        success: false,
        error: 'Auto-save failed', 
        details: e.message 
      }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/companies/:id/form_data
  def update_form_data
    step_data = params[:step_data] || {}
    step_name = params[:step_name]
    
    begin
      @company.update_form_data(step_data, step_name)
      
      render json: {
        success: true,
        data: {
          updated: true,
          form_data: @company.form_data,
          formation_step: @company.formation_step,
          form_completion_percentage: @company.form_completion_percentage
        }
      }
    rescue => e
      render json: { 
        success: false,
        error: 'Form data update failed', 
        details: e.message 
      }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/companies/:id/merge_auto_save
  def merge_auto_save
    begin
      @company.merge_auto_save_to_form_data!
      
      render json: {
        success: true,
        data: {
          merged: true,
          form_data: @company.form_data,
          formation_step: @company.formation_step,
          has_unsaved_changes: @company.has_unsaved_changes?
        }
      }
    rescue => e
      render json: { 
        success: false,
        error: 'Merge auto-save failed', 
        details: e.message 
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/companies/:id/form_state
  def form_state
    render json: {
      success: true,
      data: {
        form_data: @company.form_data,
        auto_save_data: @company.auto_save_form_data,
        formation_step: @company.formation_step,
        form_completion_percentage: @company.form_completion_percentage,
        has_unsaved_changes: @company.has_unsaved_changes?,
        last_auto_save_at: @company.last_auto_save_at,
        freezone_config: @company.freezone_config || @company.free_zone
      }
    }
  end

  # PATCH /api/v1/companies/:id/owner_details
  def update_owner_details
    permitted_params = params.permit(:company_website, :operating_name_arabic, :company_phone)
    
    # Update metadata with new values
    current_metadata = @company.metadata || {}
    
    if permitted_params[:company_website].present?
      current_metadata['website'] = permitted_params[:company_website]
    end
    
    if permitted_params[:operating_name_arabic].present?
      current_metadata['operating_name_arabic'] = permitted_params[:operating_name_arabic]
    end
    
    # Update phone in formation data (primary shareholder)
    if permitted_params[:company_phone].present?
      form_data = @company.form_data || {}
      shareholders = form_data['shareholders'] || []
      if shareholders.any?
        shareholders[0] = shareholders[0].merge('mobile' => permitted_params[:company_phone])
        @company.update!(formation_data: form_data.merge('shareholders' => shareholders))
      end
    end
    
    # Update owner's email if provided (email managed by Devise)
    if permitted_params[:company_email].present? && current_user == @company.owner
      current_user.update!(email: permitted_params[:company_email])
    end
    
    if @company.update!(metadata: current_metadata)
      render json: {
        success: true,
        data: serialize_company_detailed(@company),
        message: 'Company details updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @company.errors.full_messages
      }, status: :unprocessable_entity
    end
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
  
  def authorize_owner_access
    unless @company.owner == current_user
      render json: {
        success: false,
        error: 'Owner access required'
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
  
  def serialize_admin_company(company)
    {
      id: company.id,
      name: company.name,
      tradeName: company.trade_name,
      licenseNumber: company.license_number,
      freeZone: company.free_zone,
      status: company.status,
      formedAt: company.formed_at&.iso8601,
      licenseExpiryDate: company.license_expiry_date&.iso8601,
      ownerEmail: company.owner&.email,
      ownerFullName: company.owner&.full_name,
      estimatedAnnualTurnover: company.estimated_annual_turnover,
      shareholderCount: company.shareholders.count,
      directorCount: company.directors.count,
      licenseType: company.license_type,
      businessCommunity: company.business_community,
      createdAt: company.created_at.iso8601,
      updatedAt: company.updated_at.iso8601
    }
  end

  def serialize_company_detailed(company)
    base_data = serialize_company(company)
    
    # Get formation data
    form_data = company.form_data || {}
    
    # Get primary shareholder (first shareholder) for phone number
    primary_shareholder = form_data.dig('shareholders', 0) || {}
    
    # Get tax registration for TRN
    corporate_tax = company.tax_registrations.find_by(registration_type: 'corporate_tax')
    
    # Get freezone details
    freezone = Freezone.find_by(code: company.free_zone)
    
    # Get key documents
    trade_license_doc = company.documents.find_by(document_type: 'trade_license')
    moa_doc = company.documents.find_by(document_type: 'moa')
    aoa_doc = company.documents.find_by(document_type: 'aoa')
    
    # Calculate days since company creation for TRN deadline
    days_since_creation = company.created_at ? (Date.current - company.created_at.to_date).to_i : 0
    trn_days_remaining = [90 - days_since_creation, 0].max
    
    base_data.merge({
      activity_codes: company.activity_codes,
      metadata: company.metadata,
      members_count: company.company_memberships.accepted.count,
      documents_count: company.documents.count,
      current_workflow: company.current_workflow ? 
                        serialize_workflow_instance(company.current_workflow) : nil,
      
      # Company Details for Owner Dashboard
      company_website: company.metadata.dig('website') || form_data.dig('company_website'),
      operating_name_arabic: company.metadata.dig('operating_name_arabic') || form_data.dig('operating_name_arabic'),
      legal_framework: freezone&.name || company.free_zone,
      company_phone: primary_shareholder.dig('mobile') || primary_shareholder.dig('phone'),
      visa_eligibility: form_data.dig('visa_count') || 0,
      
      # Tax Registration
      trn_number: corporate_tax&.trn_number,
      trn_status: corporate_tax&.status,
      trn_days_remaining: trn_days_remaining,
      trn_deadline_status: trn_days_remaining == 0 ? 'overdue' : (trn_days_remaining <= 30 ? 'warning' : 'normal'),
      
      # License Information
      license_type: "#{company.free_zone} Freezone License",
      license_issue_date: company.metadata.dig('license_issue_date'),
      license_expiry_date: company.metadata.dig('license_expiry_date'),
      first_license_issue_date: company.metadata.dig('first_license_issue_date'),
      establishment_card_number: company.metadata.dig('establishment_card_number'),
      establishment_card_issue_date: company.metadata.dig('establishment_card_issue_date'),
      establishment_card_expiry_date: company.metadata.dig('establishment_card_expiry_date'),
      
      # Key Documents
      documents: {
        trade_license: trade_license_doc ? serialize_document(trade_license_doc) : nil,
        certificate_of_incorporation: moa_doc ? serialize_document(moa_doc) : nil,
        register_of_directors: aoa_doc ? serialize_document(aoa_doc) : nil
      }
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
  
  def serialize_document(document)
    {
      id: document.id,
      name: document.name,
      file_name: document.file_name,
      document_type: document.document_type,
      file_size: document.file_size,
      content_type: document.content_type,
      is_image: document.is_image?,
      is_pdf: document.is_pdf?,
      created_at: document.created_at&.iso8601,
      download_url: "/api/v1/documents/#{document.id}/download"
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

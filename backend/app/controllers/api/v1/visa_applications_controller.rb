class Api::V1::VisaApplicationsController < ApplicationController
  before_action :set_visa_application, only: [:show, :update, :destroy]
  before_action :authorize_visa_access
  
  def index
    @visa_applications = current_user_visa_applications
    
    # Handle case when user has no companies or visa applications
    if @visa_applications.nil? || @visa_applications.empty?
      return render json: {
        success: true,
        data: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_count: 0,
          per_page: params[:per_page] || 20
        }
      }
    end
    
    @visa_applications = @visa_applications.includes(:company, :person)
                                          .order(created_at: :desc)
                                          .page(params[:page])
                                          .per(params[:per_page] || 20)
    
    render json: {
      success: true,
      data: @visa_applications.map { |visa| serialize_visa_application(visa) },
      pagination: pagination_meta(@visa_applications)
    }
  end
  
  def show
    render json: {
      success: true,
      data: serialize_visa_application_detailed(@visa_application)
    }
  end
  
  def create
    # Get all companies accessible to the user (owned + memberships)
    accessible_companies = Company.where(
      'owner_id = ? OR id IN (SELECT company_id FROM company_memberships WHERE user_id = ?)', 
      current_user.id, current_user.id
    )
    
    @company = accessible_companies.find_by(id: params[:company_id])
    unless @company
      return render json: {
        success: false,
        error: 'Company not found or access denied'
      }, status: :not_found
    end
    
    @person = @company.people.find(params[:person_id])
    
    @visa_application = @company.visa_applications.build(visa_application_params)
    @visa_application.person = @person
    
    if @visa_application.save
      render json: {
        success: true,
        data: serialize_visa_application_detailed(@visa_application),
        message: 'Visa application created successfully'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @visa_application.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def update
    if @visa_application.update(visa_application_params)
      render json: {
        success: true,
        data: serialize_visa_application_detailed(@visa_application),
        message: 'Visa application updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @visa_application.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @visa_application.destroy
    render json: {
      success: true,
      message: 'Visa application deleted successfully'
    }
  end
  
  private
  
  def set_visa_application
    @visa_application = VisaApplication.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Visa application not found'
    }, status: :not_found
  end
  
  def authorize_visa_access
    if @visa_application
      unless @visa_application.company.can_be_accessed_by?(current_user)
        render json: {
          success: false,
          error: 'Access denied'
        }, status: :forbidden
      end
    end
  end
  
  def current_user_visa_applications
    # Get all visa applications for companies the user has access to (owned + memberships)
    accessible_companies = Company.where(
      'owner_id = ? OR id IN (SELECT company_id FROM company_memberships WHERE user_id = ?)', 
      current_user.id, current_user.id
    )
    company_ids = accessible_companies.pluck(:id)
    VisaApplication.joins(:company).where(company_id: company_ids)
  end
  
  def visa_application_params
    params.require(:visa_application).permit(
      :visa_type, :visa_fee, :fee_currency, :notes,
      application_data: {}
    )
  end
  
  def serialize_visa_application(visa)
    {
      id: visa.id,
      visa_type: visa.visa_type,
      status: visa.status,
      current_stage: visa.current_stage,
      total_stages: visa.total_stages,
      stage_name: visa.stage_name,
      progress_percentage: visa.progress_percentage,
      application_number: visa.application_number,
      visa_number: visa.visa_number,
      visa_fee: visa.visa_fee,
      fee_currency: visa.fee_currency,
      submitted_at: visa.submitted_at&.iso8601,
      completed_at: visa.completed_at&.iso8601,
      estimated_completion_date: visa.estimated_completion_date&.iso8601,
      days_until_completion: visa.days_until_completion,
      is_overdue: visa.is_overdue?,
      created_at: visa.created_at.iso8601,
      company: {
        id: visa.company.id,
        name: visa.company.name,
        free_zone: visa.company.free_zone
      },
      person: {
        id: visa.person.id,
        full_name: visa.person.full_name,
        nationality: visa.person.nationality
      }
    }
  end
  
  def serialize_visa_application_detailed(visa)
    base_data = serialize_visa_application(visa)
    
    base_data.merge({
      application_data: visa.application_data,
      stage_history: visa.stage_history,
      notes: visa.notes,
      entry_permit_number: visa.entry_permit_number,
      entry_permit_date: visa.entry_permit_date&.iso8601,
      medical_date: visa.medical_date&.iso8601,
      eid_appointment_date: visa.eid_appointment_date&.iso8601,
      stamping_date: visa.stamping_date&.iso8601,
      visa_issuance_date: visa.visa_issuance_date&.iso8601,
      visa_expiry_date: visa.visa_expiry_date&.iso8601,
      required_documents: visa.get_required_documents_for_stage
    })
  end
  
  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count,
      per_page: collection.limit_value
    }
  end
end

class Api::V1::TaxRegistrationsController < ApplicationController
  before_action :set_company, only: [:index, :create]
  before_action :set_tax_registration, only: [:show, :update, :destroy, :apply, :approve, :reject]
  before_action :authorize_tax_access
  
  def index
    @tax_registrations = @company.tax_registrations.order(created_at: :desc)
    
    render json: {
      success: true,
      data: @tax_registrations.map { |registration| serialize_tax_registration(registration) },
      stats: {
        total: @tax_registrations.count,
        active: @tax_registrations.active_registrations.count,
        pending: @tax_registrations.pending_registrations.count,
        overdue_filings: @tax_registrations.select(&:is_overdue?).count
      }
    }
  end
  
  def show
    render json: {
      success: true,
      data: serialize_tax_registration_detailed(@tax_registration)
    }
  end
  
  def create
    @tax_registration = @company.tax_registrations.build(tax_registration_params)
    
    if @tax_registration.save
      render json: {
        success: true,
        data: serialize_tax_registration_detailed(@tax_registration),
        message: 'Tax registration created successfully'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @tax_registration.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def update
    if @tax_registration.update(tax_registration_params)
      render json: {
        success: true,
        data: serialize_tax_registration_detailed(@tax_registration),
        message: 'Tax registration updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @tax_registration.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @tax_registration.destroy
    render json: {
      success: true,
      message: 'Tax registration deleted successfully'
    }
  end
  
  def apply
    unless @tax_registration.can_apply?
      return render json: {
        success: false,
        error: 'Cannot apply for this registration at this time'
      }, status: :unprocessable_entity
    end
    
    application_data = params[:application_data] || {}
    @tax_registration.apply_for_registration!(application_data)
    
    render json: {
      success: true,
      data: serialize_tax_registration(@tax_registration),
      message: 'Application submitted successfully'
    }
  end
  
  def approve
    unless can_approve_registration?
      return render json: {
        success: false,
        error: 'Not authorized to approve registrations'
      }, status: :forbidden
    end
    
    trn_number = params[:trn_number]
    effective_date = params[:effective_date] ? Date.parse(params[:effective_date]) : Date.current
    
    @tax_registration.approve_registration!(trn_number, effective_date)
    
    render json: {
      success: true,
      data: serialize_tax_registration(@tax_registration),
      message: 'Registration approved successfully'
    }
  end
  
  def reject
    unless can_approve_registration?
      return render json: {
        success: false,
        error: 'Not authorized to reject registrations'
      }, status: :forbidden
    end
    
    reason = params[:reason] || 'No reason provided'
    @tax_registration.reject_registration!(reason)
    
    render json: {
      success: true,
      data: serialize_tax_registration(@tax_registration),
      message: 'Registration rejected'
    }
  end
  
  private
  
  def set_company
    if params[:company_id]
      @company = current_user.companies.find(params[:company_id])
    else
      # If no company_id provided, use the first company the user has access to
      @company = current_user.companies.first
    end
    
    unless @company
      render json: {
        success: false,
        error: 'Company not found or access denied'
      }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found or access denied'
    }, status: :not_found
  end
  
  def set_tax_registration
    @tax_registration = TaxRegistration.find(params[:id])
    @company = @tax_registration.company
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Tax registration not found'
    }, status: :not_found
  end
  
  def authorize_tax_access
    return unless @company
    
    unless current_user.can_access_company?(@company)
      render json: {
        success: false,
        error: 'Access denied'
      }, status: :forbidden
    end
    
    # For modifying operations, require appropriate role
    if %w[create update destroy apply].include?(action_name)
      user_role = current_user.role_for_company(@company)
      unless %w[owner admin accountant].include?(user_role)
        render json: {
          success: false,
          error: 'Not authorized to manage tax registrations'
        }, status: :forbidden
      end
    end
  end
  
  def can_approve_registration?
    current_user.admin? || %w[csp_admin super_admin].include?(current_user.role_for_company(@company))
  end
  
  def tax_registration_params
    params.require(:tax_registration).permit(
      :registration_type, :annual_turnover, :tax_period, :notes,
      registration_details: {}
    )
  end
  
  def serialize_tax_registration(registration)
    {
      id: registration.id,
      registration_type: registration.registration_type,
      status: registration.status,
      trn_number: registration.trn_number,
      registration_date: registration.registration_date&.iso8601,
      effective_date: registration.effective_date&.iso8601,
      next_filing_date: registration.next_filing_date&.iso8601,
      annual_turnover: registration.annual_turnover,
      tax_period: registration.tax_period,
      applied_at: registration.applied_at&.iso8601,
      approved_at: registration.approved_at&.iso8601,
      rejected_at: registration.rejected_at&.iso8601,
      is_overdue: registration.is_overdue?,
      days_until_filing: registration.days_until_filing,
      can_apply: registration.can_apply?,
      can_file_return: registration.can_file_return?,
      registration_required: registration.registration_required?,
      created_at: registration.created_at.iso8601,
      company: {
        id: registration.company.id,
        name: registration.company.name
      }
    }
  end
  
  def serialize_tax_registration_detailed(registration)
    base_data = serialize_tax_registration(registration)
    
    base_data.merge({
      registration_details: registration.registration_details,
      filing_history: registration.filing_history,
      notes: registration.notes,
      rejection_reason: registration.rejection_reason
    })
  end
end

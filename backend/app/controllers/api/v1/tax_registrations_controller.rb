class Api::V1::TaxRegistrationsController < ApplicationController
  before_action :set_company
  before_action :authorize_company_access
  before_action :set_tax_registration, only: [:show, :update, :apply]
  
  def index
    @tax_registrations = @company.tax_registrations.order(created_at: :desc)
    
    render json: {
      success: true,
      data: @tax_registrations.map { |registration| serialize_tax_registration(registration) }
    }
  end
  
  def show
    render json: {
      success: true,
      data: serialize_tax_registration(@tax_registration)
    }
  end
  
  def create
    @tax_registration = @company.tax_registrations.build(tax_registration_params)
    
    if @tax_registration.save
      render json: {
        success: true,
        data: serialize_tax_registration(@tax_registration),
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
        data: serialize_tax_registration(@tax_registration),
        message: 'Tax registration updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @tax_registration.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v1/companies/:company_id/tax_registrations/:id/apply
  def apply
    unless @tax_registration.can_apply?
      return render json: {
        success: false,
        error: 'Cannot apply for tax registration at this time'
      }, status: :unprocessable_entity
    end
    
    application_data = params[:application_data] || {}
    
    begin
      @tax_registration.apply_for_registration!(application_data)
      
      render json: {
        success: true,
        data: serialize_tax_registration(@tax_registration),
        message: 'Tax registration application submitted successfully'
      }
    rescue => e
      render json: {
        success: false,
        error: 'Failed to submit tax registration application',
        details: e.message
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_company
    @company = Company.find(params[:company_id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found'
    }, status: :not_found
  end
  
  def set_tax_registration
    @tax_registration = @company.tax_registrations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Tax registration not found'
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
      registration_details: registration.registration_details,
      filing_history: registration.filing_history,
      notes: registration.notes,
      applied_at: registration.applied_at&.iso8601,
      approved_at: registration.approved_at&.iso8601,
      rejected_at: registration.rejected_at&.iso8601,
      rejection_reason: registration.rejection_reason,
      created_at: registration.created_at.iso8601,
      updated_at: registration.updated_at.iso8601,
      can_apply: registration.can_apply?,
      can_file_return: registration.can_file_return?,
      is_overdue: registration.is_overdue?,
      days_until_filing: registration.days_until_filing,
      filing_requirements: registration.get_filing_requirements
    }
  end
end

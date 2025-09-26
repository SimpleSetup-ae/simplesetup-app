class Api::V1::Admin::CompaniesController < ApplicationController
  before_action :require_admin
  before_action :set_company, only: [:show]
  
  # GET /api/v1/admin/companies
  def index
    @companies = Company.where(status: ['approved', 'formed', 'active', 'issued'])
                        .includes(:owner, :shareholders, :directors, :documents)
                        .order(created_at: :desc)
    
    # Apply filters
    @companies = @companies.where(status: params[:status]) if params[:status].present?
    @companies = @companies.where(free_zone: params[:free_zone]) if params[:free_zone].present?
    
    # Search
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @companies = @companies.joins(:owner).where(
        "companies.name ILIKE ? OR companies.license_number ILIKE ? OR users.first_name ILIKE ? OR users.last_name ILIKE ? OR users.email ILIKE ?",
        search_term, search_term, search_term, search_term, search_term
      )
    end
    
    render json: {
      success: true,
      companies: @companies.map { |company| serialize_admin_company(company) },
      stats: calculate_company_stats
    }
  end
  
  # GET /api/v1/admin/companies/:id
  def show
    render json: {
      success: true,
      company: serialize_detailed_admin_company(@company)
    }
  end
  
  private
  
  def set_company
    @company = Company.find(params[:id])
  end
  
  def require_admin
    unless current_user&.is_admin?
      render json: { error: 'Admin access required' }, status: :forbidden
    end
  end
  
  def serialize_admin_company(company)
    # Use the first choice company name from name_options if available, otherwise fall back to company.name
    first_choice_name = company.name_options&.first || company.name
    
    {
      id: company.id,
      name: first_choice_name,
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
  
  def serialize_detailed_admin_company(company)
    serialize_admin_company(company).merge(
      shareholders: company.shareholders.map { |s| serialize_person(s) },
      directors: company.directors.map { |d| serialize_person(d) },
      documents: company.documents.map { |d| serialize_document(d) },
      activityCodes: company.activity_codes,
      metadata: company.metadata
    )
  end
  
  def serialize_person(person)
    {
      id: person.id,
      type: person.type,
      firstName: person.first_name,
      lastName: person.last_name,
      fullName: "#{person.first_name} #{person.last_name}".strip,
      nationality: person.nationality,
      passportNumber: person.passport_number,
      sharePercentage: person.share_percentage,
      appointmentType: person.appointment_type
    }
  end
  
  def serialize_document(document)
    {
      id: document.id,
      name: document.name,
      documentType: document.document_type,
      uploadedAt: document.uploaded_at&.iso8601,
      verified: document.verified,
      ocrStatus: document.ocr_status
    }
  end
  
  def calculate_company_stats
    all_companies = Company.where(status: ['approved', 'formed', 'active', 'issued'])
    now = Date.current
    three_months_from_now = now + 3.months
    
    {
      total: all_companies.count,
      approved: all_companies.where(status: 'approved').count,
      active: all_companies.where(status: 'active').count,
      formed: all_companies.where(status: 'formed').count,
      issued: all_companies.where(status: 'issued').count,
      expiringLicenses: all_companies.where(
        license_expiry_date: now..three_months_from_now
      ).count
    }
  end
end

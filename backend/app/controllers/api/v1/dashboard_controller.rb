class Api::V1::DashboardController < ApplicationController
  def show
    # Get user's owned companies (Company Owner role)
    owned_companies = current_user.owned_companies
                                  .includes(:shareholders, :directors, :documents, :tax_registrations)
                                  .order(created_at: :desc)
    
    # If user has no companies, return empty dashboard
    if owned_companies.empty?
      return render json: {
        success: true,
        data: {
          companies: [],
          notifications: [],
          stats: {
            total_companies: 0,
            in_progress: 0,
            completed: 0,
            documents_pending: 0
          }
        }
      }
    end
    
    # Calculate stats
    stats = {
      total_companies: owned_companies.count,
      in_progress: owned_companies.where(status: ['draft', 'in_progress', 'pending_payment', 'processing']).count,
      completed: owned_companies.where(status: ['approved', 'issued']).count,
      documents_pending: owned_companies.sum { |c| c.documents.where(verified: false).count }
    }
    
    # Serialize companies with dashboard-specific data
    companies_data = owned_companies.map { |company| serialize_company_for_dashboard(company) }
    
    # Generate notifications
    notifications = generate_notifications_for_user(owned_companies)
    
    render json: {
      success: true,
      data: {
        companies: companies_data,
        notifications: notifications,
        stats: stats
      }
    }
  end
  
  private
  
  def serialize_company_for_dashboard(company)
    # Get shareholders with passport expiry data
    shareholders = company.shareholders.map do |shareholder|
      {
        id: shareholder.id,
        full_name: shareholder.full_name,
        identification_type: shareholder.identification_type,
        identification_number: shareholder.identification_number,
        passport_number: shareholder.passport_number,
        passport_expiry_date: get_passport_expiry_date(shareholder),
        share_percentage: shareholder.share_percentage,
        type: shareholder.type
      }
    end
    
    # Get directors
    directors = company.directors.map do |director|
      {
        id: director.id,
        full_name: director.full_name,
        identification_type: director.identification_type,
        identification_number: director.identification_number,
        passport_number: director.passport_number,
        passport_expiry_date: get_passport_expiry_date(director),
        type: director.type
      }
    end
    
    # Get key documents
    documents = {
      trade_license: get_document_info(company, 'trade_license'),
      moa: get_document_info(company, 'moa'),
      certificate_of_incorporation: get_document_info(company, 'certificate_of_incorporation'),
      commercial_license: get_document_info(company, 'commercial_license')
    }
    
    # Calculate days until license renewal
    license_renewal_days = nil
    if company.license_expiry_date
      license_renewal_days = (company.license_expiry_date - Date.current).to_i
    end
    
    {
      id: company.id,
      name: company.name,
      trade_name: company.trade_name,
      free_zone: company.free_zone,
      status: company.status,
      license_number: company.license_number,
      license_status: company.license_status,
      formation_progress: company.formation_progress,
      
      # License and renewal information
      license_type: company.license_type,
      license_expiry_date: company.license_expiry_date&.iso8601,
      license_renewal_days: license_renewal_days,
      establishment_card_number: company.establishment_card_number,
      establishment_card_expiry_date: company.establishment_card_expiry_date&.iso8601,
      
      # Contact information
      official_email: company.official_email,
      phone: company.phone,
      website: company.website,
      
      # People
      shareholders: shareholders,
      directors: directors,
      
      # Documents
      documents: documents,
      
      # Timestamps
      created_at: company.created_at.iso8601,
      updated_at: company.updated_at.iso8601
    }
  end
  
  def get_passport_expiry_date(person)
    # Return passport expiry from person record if available
    return person.passport_expiry_date&.iso8601 if person.passport_expiry_date
    
    # Fallback: Try to get from associated passport document
    passport_doc = person.company.documents.find_by(
      document_type: 'passport',
      person_id: person.id
    )
    
    if passport_doc&.extracted_data
      expiry_date = passport_doc.extracted_data.dig('passport_expiry_date') ||
                   passport_doc.extracted_data.dig('expiry_date') ||
                   passport_doc.extracted_data.dig('date_of_expiry')
      
      begin
        return Date.parse(expiry_date).iso8601 if expiry_date.present?
      rescue Date::Error
        # Invalid date format in extracted data
        nil
      end
    end
    
    nil
  end
  
  def get_document_info(company, document_type)
    document = company.documents.find_by(document_type: document_type)
    
    return nil unless document
    
    {
      id: document.id,
      name: document.name,
      file_name: document.file_name,
      uploaded_at: document.uploaded_at&.iso8601,
      verified: document.verified,
      download_url: "/api/v1/documents/#{document.id}/download"
    }
  end
  
  def generate_notifications_for_user(companies)
    notifications = []
    
    companies.each do |company|
      # License expiry notifications
      if company.license_expiry_date
        days_until_expiry = (company.license_expiry_date - Date.current).to_i
        
        if days_until_expiry <= 30 && days_until_expiry > 0
          notifications << {
            id: "license_expiry_#{company.id}",
            type: 'license_expiry',
            title: 'License Renewal Due Soon',
            message: "Your license for #{company.name} expires in #{days_until_expiry} days",
            company_id: company.id,
            company_name: company.name,
            urgency: days_until_expiry <= 7 ? 'high' : 'medium',
            created_at: Time.current.iso8601
          }
        elsif days_until_expiry <= 0
          notifications << {
            id: "license_expired_#{company.id}",
            type: 'license_expired',
            title: 'License Expired',
            message: "Your license for #{company.name} has expired",
            company_id: company.id,
            company_name: company.name,
            urgency: 'critical',
            created_at: Time.current.iso8601
          }
        end
      end
      
      # Tax registration deadline notifications
      if company.needs_tax_registration?
        days_until_deadline = company.days_until_tax_deadline
        
        if days_until_deadline && days_until_deadline <= 60
          urgency = case company.tax_deadline_status
                   when 'overdue' then 'critical'
                   when 'urgent' then 'high'
                   when 'warning' then 'medium'
                   else 'low'
                   end
          
          notifications << {
            id: "tax_registration_#{company.id}",
            type: 'tax_registration',
            title: 'Corporate Tax Registration Required',
            message: "Register for Corporate Tax - #{days_until_deadline} days remaining",
            company_id: company.id,
            company_name: company.name,
            urgency: urgency,
            created_at: Time.current.iso8601
          }
        end
      end
      
      # Document verification notifications
      unverified_docs = company.documents.where(verified: false).count
      if unverified_docs > 0
        notifications << {
          id: "documents_pending_#{company.id}",
          type: 'documents_pending',
          title: 'Documents Pending Verification',
          message: "#{unverified_docs} document(s) pending verification for #{company.name}",
          company_id: company.id,
          company_name: company.name,
          urgency: 'medium',
          created_at: Time.current.iso8601
        }
      end
      
      # Formation progress notifications
      if company.status == 'in_progress' && company.formation_progress < 100
        notifications << {
          id: "formation_progress_#{company.id}",
          type: 'formation_progress',
          title: 'Complete Company Formation',
          message: "#{company.name} formation is #{company.formation_progress}% complete",
          company_id: company.id,
          company_name: company.name,
          urgency: 'low',
          created_at: Time.current.iso8601
        }
      end
    end
    
    # Sort by urgency and date
    urgency_order = { 'critical' => 0, 'high' => 1, 'medium' => 2, 'low' => 3 }
    notifications.sort_by { |n| [urgency_order[n[:urgency]] || 4, n[:created_at]] }
  end
end

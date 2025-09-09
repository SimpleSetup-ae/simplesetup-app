class Api::V1::DashboardController < Api::V1::BaseController
  # GET /api/v1/companies/:company_id/dashboard
  def show
    @company = current_user.companies.find(params[:company_id])
    
    # Get company details with relationships
    company_data = serialize_company_dashboard(@company)
    
    # Get shareholders/directors with passport details
    shareholders = @company.people.includes(:documents)
                           .where(type: ['shareholder', 'director'])
                           .order(:type, :created_at)
    
    # Get recent notifications for this company
    notifications = current_user.notifications
                               .where(company: @company)
                               .active
                               .recent
                               .limit(5)
    
    # Calculate license renewal countdown
    renewal_info = calculate_renewal_info(@company)
    
    render json: {
      success: true,
      data: {
        company: company_data,
        shareholders: shareholders.map { |person| serialize_shareholder(person) },
        notifications: notifications.map { |notification| serialize_notification(notification) },
        renewal_info: renewal_info,
        documents: {
          trade_license: @company.trade_license_url,
          moa: @company.moa_url
        }
      }
    }
  end
  
  private
  
  def serialize_company_dashboard(company)
    {
      id: company.id,
      name: company.name,
      trade_name: company.trade_name,
      free_zone: company.free_zone,
      status: company.status,
      license_number: company.license_number,
      formation_progress: company.formation_progress,
      formation_step: company.formation_step,
      license_issued_at: company.license_issued_at&.iso8601,
      license_renewal_date: company.license_renewal_date&.iso8601,
      created_at: company.created_at.iso8601,
      updated_at: company.updated_at.iso8601,
      status_display: status_display(company.status),
      progress_percentage: calculate_progress_percentage(company)
    }
  end
  
  def serialize_shareholder(person)
    {
      id: person.id,
      full_name: person.full_name,
      type: person.type,
      share_percentage: person.share_percentage,
      identification: {
        type: person.identification_type,
        number: person.identification_number,
        passport_number: person.passport_number,
        emirates_id: person.emirates_id,
        passport_expiry_date: person.passport_expiry_date&.iso8601,
        emirates_id_expiry_date: person.emirates_id_expiry_date&.iso8601
      },
      expiry_status: calculate_expiry_status(person)
    }
  end
  
  def serialize_notification(notification)
    {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      action_url: notification.action_url,
      read: notification.read,
      created_at: notification.created_at.iso8601,
      expires_at: notification.expires_at&.iso8601
    }
  end
  
  def calculate_renewal_info(company)
    return nil unless company.license_renewal_date.present?
    
    days_until_renewal = (company.license_renewal_date.to_date - Date.current).to_i
    
    {
      renewal_date: company.license_renewal_date.iso8601,
      days_until_renewal: days_until_renewal,
      status: renewal_status(days_until_renewal),
      urgency: renewal_urgency(days_until_renewal)
    }
  end
  
  def calculate_expiry_status(person)
    return 'no_document' unless person.passport_expiry_date.present?
    
    days_until_expiry = (person.passport_expiry_date - Date.current).to_i
    
    if days_until_expiry < 0
      'expired'
    elsif days_until_expiry <= 30
      'critical'
    elsif days_until_expiry <= 90
      'warning'
    else
      'valid'
    end
  end
  
  def status_display(status)
    case status
    when 'draft'
      'Draft - Not Started'
    when 'in_progress'
      'Formation in Progress'
    when 'pending_payment'
      'Pending Payment'
    when 'processing'
      'Under Review'
    when 'approved'
      'Approved - Awaiting License'
    when 'rejected'
      'Rejected - Requires Action'
    when 'issued'
      'License Issued - Complete'
    else
      status.humanize
    end
  end
  
  def calculate_progress_percentage(company)
    case company.status
    when 'draft'
      0
    when 'in_progress'
      company.formation_progress || 25
    when 'pending_payment'
      60
    when 'processing'
      75
    when 'approved'
      90
    when 'issued'
      100
    when 'rejected'
      50
    else
      0
    end
  end
  
  def renewal_status(days_until_renewal)
    if days_until_renewal < 0
      'overdue'
    elsif days_until_renewal <= 30
      'critical'
    elsif days_until_renewal <= 60
      'warning'
    else
      'normal'
    end
  end
  
  def renewal_urgency(days_until_renewal)
    if days_until_renewal < 0
      'high'
    elsif days_until_renewal <= 30
      'high'
    elsif days_until_renewal <= 60
      'medium'
    else
      'low'
    end
  end
end

class Api::V1::ApplicationsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:create, :show, :update, :progress]
  before_action :set_company, except: [:create, :index, :admin_index]
  before_action :require_admin, only: [:admin_index, :admin_show, :admin_update]
  
  # GET /api/v1/applications (for logged-in users)
  def index
    @companies = current_user.owned_companies.includes(:application_progress)
    render json: {
      success: true,
      applications: @companies.map { |c| serialize_application(c) }
    }
  end
  
  # POST /api/v1/applications (anonymous draft creation)
  def create
    @company = Company.new(
      name: 'Draft Application',
      free_zone: params[:free_zone] || 'IFZA',
      status: 'anonymous_draft',
      formation_type: params[:formation_type] || 'new_company'
    )
    
    if @company.save
      # Create application progress tracker
      @company.create_application_progress!(step: 0, percent: 0)
      
      # Set draft token in cookies
      cookies[:draft_token] = {
        value: @company.draft_token,
        expires: 30.days.from_now,
        httponly: true,
        secure: Rails.env.production?
      }
      
      render json: {
        success: true,
        application_id: @company.id,
        draft_token: @company.draft_token,
        external_ref: @company.id.split('-').first.upcase
      }
    else
      render json: {
        success: false,
        errors: @company.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # GET /api/v1/applications/:id
  def show
    render json: {
      success: true,
      application: serialize_full_application(@company)
    }
  end
  
  # PATCH /api/v1/applications/:id (autosave)
  def update
    # Store data in auto_save_data for drafts
    if @company.update(application_params)
      @company.auto_save_form_data!(params[:form_data], params[:step_name]) if params[:form_data]
      
      render json: {
        success: true,
        application: serialize_application(@company)
      }
    else
      render json: {
        success: false,
        errors: @company.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # PATCH /api/v1/applications/:id/progress
  def progress
    if @company.application_progress
      @company.application_progress.update_progress(
        params[:step].to_i,
        params[:current_page],
        params[:page_data] || {}
      )
      
      @company.update(formation_step: params[:current_page]) if params[:current_page]
    end
    
    render json: { success: true }
  end
  
  # POST /api/v1/applications/:id/claim (after user signs up)
  def claim
    if @company.anonymous_draft? && @company.draft_token == params[:draft_token]
      if @company.claim_by_user!(current_user)
        render json: {
          success: true,
          message: 'Application claimed successfully'
        }
      else
        render json: {
          success: false,
          message: 'Could not claim application'
        }, status: :unprocessable_entity
      end
    else
      render json: {
        success: false,
        message: 'Invalid draft token or application already claimed'
      }, status: :forbidden
    end
  end
  
  # POST /api/v1/applications/:id/submit
  def submit
    # Transform auto-save data to database records before validation
    transform_auto_save_data_to_records!(@company)
    
    # Validate all required fields
    validation_errors = validate_submission(@company)
    
    if validation_errors.any?
      render json: {
        success: false,
        errors: validation_errors
      }, status: :unprocessable_entity
      return
    end
    
    # Merge autosave data and update status
    @company.merge_auto_save_to_form_data!
    @company.update!(
      status: 'submitted',
      submitted_at: Time.current,
      formation_step: 'submitted'
    )
    
    # Update progress to 100%
    @company.application_progress&.update!(step: 7, percent: 100)
    
    # Send confirmation email
    ApplicationMailer.submission_confirmation(@company).deliver_later if @company.owner
    
    render json: {
      success: true,
      message: 'Application submitted successfully',
      application: serialize_application(@company)
    }
  end
  
  # Admin endpoints
  
  # GET /api/v1/applications/admin
  def admin_index
    @companies = Company.admin_viewable
                        .includes(:owner, :application_progress, :documents)
                        .order(submitted_at: :desc)
    
    # Apply filters
    @companies = @companies.where(status: params[:status]) if params[:status].present?
    @companies = @companies.where(free_zone: params[:free_zone]) if params[:free_zone].present?
    
    # Pagination
    page = params[:page] || 1
    per_page = params[:per_page] || 20
    @companies = @companies.page(page).per(per_page)
    
    render json: {
      success: true,
      applications: @companies.map { |c| serialize_admin_application(c) },
      meta: {
        current_page: @companies.current_page,
        total_pages: @companies.total_pages,
        total_count: @companies.total_count
      }
    }
  end
  
  # GET /api/v1/applications/admin/:id
  def admin_show
    @company = Company.find(params[:id])
    render json: {
      success: true,
      application: serialize_full_admin_application(@company)
    }
  end
  
  # PATCH /api/v1/applications/admin/:id
  def admin_update
    @company = Company.find(params[:id])
    
    # Update status
    if params[:status].present?
      @company.update!(status: params[:status])
      
      # Set appropriate timestamp
      case params[:status]
      when 'approved'
        @company.update!(approved_at: Time.current)
      when 'rejected'
        @company.update!(rejected_at: Time.current, rejection_reason: params[:rejection_reason])
      when 'formed', 'active'
        @company.update!(formed_at: Time.current)
      end
    end
    
    # Update license information
    if params[:license_data].present?
      @company.update!(license_data_params)
    end
    
    # Send notification to client
    if params[:notify_client] == true
      ApplicationMailer.status_update(@company).deliver_later
    end
    
    render json: {
      success: true,
      message: 'Application updated successfully',
      application: serialize_admin_application(@company)
    }
  end
  
  private
  
  def set_company
    # Try to find by ID first
    if params[:id]
      @company = Company.find_by(id: params[:id])
    end
    
    # For anonymous users, also check draft token
    if @company.nil? && cookies[:draft_token].present?
      @company = Company.find_by(draft_token: cookies[:draft_token])
    end
    
    # For authenticated users, ensure they have access
    if @company && current_user && !@company.anonymous_draft?
      unless @company.can_be_accessed_by?(current_user)
        render json: { error: 'Unauthorized' }, status: :forbidden
        return
      end
    end
    
    # Handle not found
    if @company.nil?
      render json: { error: 'Application not found' }, status: :not_found
    end
  end
  
  def require_admin
    unless current_user&.is_admin?
      render json: { error: 'Admin access required' }, status: :forbidden
    end
  end
  
  def application_params
    params.permit(
      :trade_license_validity, :visa_package, :partner_visa_count,
      :inside_country_visas, :outside_country_visas, :establishment_card,
      :require_investor_or_partner_visa, :share_capital, :share_value,
      :total_shares, :voting_rights_proportional, :voting_rights_notes,
      :shareholding_type, :main_activity_id, :request_custom_activity,
      :custom_activity_description, :operate_as_franchise, :franchise_details,
      :name_arabic, :gm_signatory_name, :gm_signatory_email,
      :ubo_terms_accepted, :accept_activity_rules, :estimated_annual_turnover,
      countries_of_operation: [], name_options: []
    )
  end
  
  def license_data_params
    params.require(:license_data).permit(
      :license_number, :license_type, :license_status, :business_community,
      :first_license_issue_date, :current_license_issue_date, :license_expiry_date,
      :establishment_card_number, :establishment_card_issue_date, :establishment_card_expiry_date
    )
  end
  
  def validate_submission(company)
    errors = []
    
    # Check required fields based on form steps
    errors << "License validity required" if company.trade_license_validity.blank?
    errors << "Business activities required" if company.activity_codes.blank?
    errors << "Company name options required" if company.name_options.blank?
    errors << "Share capital required" if company.share_capital.blank?
    errors << "At least one shareholder required" if company.shareholders.empty?
    errors << "At least one director required" if company.directors.empty?
    errors << "GM signatory name required" if company.gm_signatory_name.blank?
    errors << "Terms must be accepted" unless company.ubo_terms_accepted?
    
    errors
  end
  
  def serialize_application(company)
    {
      id: company.id,
      name: company.name,
      status: company.status,
      free_zone: company.free_zone,
      formation_step: company.formation_step,
      submitted_at: company.submitted_at,
      progress: company.application_progress&.percent || 0,
      current_step: company.application_progress&.step || 0,
      has_unsaved_changes: company.has_unsaved_changes?
    }
  end
  
  def serialize_full_application(company)
    serialize_application(company).merge(
      form_data: company.auto_save_data.presence || company.form_data,
      trade_license_validity: company.trade_license_validity,
      visa_package: company.visa_package,
      partner_visa_count: company.partner_visa_count,
      share_capital: company.share_capital,
      share_value: company.share_value,
      name_options: company.name_options,
      shareholders: company.shareholders.map { |s| serialize_person(s) },
      directors: company.directors.map { |d| serialize_person(d) },
      documents: company.documents.map { |d| serialize_document(d) }
    )
  end
  
  def serialize_admin_application(company)
    serialize_application(company).merge(
      owner: company.owner ? { id: company.owner.id, email: company.owner.email } : nil,
      document_count: company.documents.count,
      last_activity: company.application_progress&.last_activity_at
    )
  end
  
  def serialize_full_admin_application(company)
    serialize_full_application(company).merge(
      owner: company.owner ? UserSerializer.new(company.owner).as_json : nil,
      license_number: company.license_number,
      license_status: company.license_status,
      all_documents: company.documents.map { |d| serialize_document_admin(d) },
      activity_details: company.activity_codes.map { |code| 
        activity = BusinessActivity.find_by(activity_code: code)
        activity ? BusinessActivitySerializer.new(activity).as_json : { code: code }
      }
    )
  end
  
  def serialize_person(person)
    {
      id: person.id,
      type: person.type,
      first_name: person.first_name,
      last_name: person.last_name,
      nationality: person.nationality,
      passport_number: person.passport_number,
      share_percentage: person.share_percentage
    }
  end

  # Transform auto-save data into actual database records and fields
  def transform_auto_save_data_to_records!(company)
    auto_save = company.auto_save_data || {}
    
    # Flatten nested step data - frontend saves under step names like 'activities', 'members', etc.
    merged_data = {}
    auto_save.each do |key, value|
      if value.is_a?(Hash)
        # If it's a step name with nested data, merge it
        merged_data.merge!(value)
      else
        # If it's already a top-level field, keep it
        merged_data[key] = value
      end
    end
    
    # Now use merged_data for all transformations
    
    # Transform business activities to activity_codes
    if merged_data['business_activities'].present?
      activity_codes = merged_data['business_activities'].map { |activity| 
        activity['activity_id'] || activity['activity_code'] 
      }.compact
      company.update!(activity_codes: activity_codes) if activity_codes.any?
    end
    
    # Transform shareholders to Person records
    if merged_data['shareholders'].present?
      # Clear existing shareholders
      company.shareholders.destroy_all
      
      merged_data['shareholders'].each do |shareholder_data|
        company.people.create!(
          type: 'shareholder',
          first_name: shareholder_data['first_name'],
          last_name: shareholder_data['last_name'],
          nationality: shareholder_data['nationality'],
          passport_number: shareholder_data['passport_number'],
          share_percentage: shareholder_data['share_percentage'],
          contact_info: {
            email: shareholder_data['email'],
            phone: shareholder_data['phone']
          }.compact,
          metadata: shareholder_data.except('first_name', 'last_name', 'nationality', 'passport_number', 'share_percentage', 'email', 'phone')
        )
      end
    end
    
    # Transform directors to Person records (General Manager becomes director)
    if merged_data['general_manager'].present?
      # Clear existing directors
      company.directors.destroy_all
      
      gm_data = merged_data['general_manager']
      company.people.create!(
        type: 'director',
        first_name: gm_data['first_name'],
        last_name: gm_data['last_name'],
        nationality: gm_data['nationality'],
        passport_number: gm_data['passport_number'],
        appointment_type: 'general_manager',
        contact_info: {
          email: gm_data['email'],
          phone: gm_data['phone']
        }.compact,
        metadata: gm_data.except('first_name', 'last_name', 'nationality', 'passport_number', 'email', 'phone')
      )
    end
    
    # Transform name options
    if merged_data['name_options'].present?
      company.update!(name_options: merged_data['name_options'])
    end
    
    # Transform GM signatory name
    if merged_data['gm_signatory_name'].present?
      company.update!(gm_signatory_name: merged_data['gm_signatory_name'])
    end
    
    # Transform UBO terms acceptance
    if merged_data.key?('ubo_terms_accepted')
      company.update!(ubo_terms_accepted: merged_data['ubo_terms_accepted'])
    end
    
    # Also update any direct application params that were saved
    update_params = {}
    update_params[:trade_license_validity] = merged_data['trade_license_validity'] if merged_data['trade_license_validity'].present?
    update_params[:visa_package] = merged_data['visa_package'] if merged_data.key?('visa_package')
    update_params[:share_capital] = merged_data['share_capital'] if merged_data['share_capital'].present?
    update_params[:share_value] = merged_data['share_value'] if merged_data['share_value'].present?
    update_params[:shareholding_type] = merged_data['shareholding_type'] if merged_data['shareholding_type'].present?
    
    company.update!(update_params) if update_params.any?
    
    # Reload associations to reflect changes
    company.reload
  end
  
  def serialize_document(document)
    {
      id: document.id,
      name: document.name,
      document_type: document.document_type,
      uploaded_at: document.uploaded_at,
      file_size: document.file_size
    }
  end
  
  def serialize_document_admin(document)
    serialize_document(document).merge(
      storage_path: document.storage_path,
      verified: document.verified,
      ocr_status: document.ocr_status,
      extracted_data: document.extracted_data
    )
  end
end

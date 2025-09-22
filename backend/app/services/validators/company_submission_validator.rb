class CompanySubmissionValidator < BaseValidator
  def initialize(company)
    @company = company
  end

  def validate
    @errors = []

    # Check required fields based on form steps
    add_error "License validity required" if @company.trade_license_validity.blank?
    add_error "Business activities required" if @company.activity_codes.blank?
    add_error "Company name options required" if @company.name_options.blank?
    add_error "Share capital required" if @company.share_capital.blank?
    add_error "At least one shareholder required" if @company.shareholders.empty?
    add_error "At least one director required" if @company.directors.empty?
    add_error "GM signatory name required" if @company.gm_signatory_name.blank?
    add_error "Terms must be accepted" unless @company.ubo_terms_accepted?

    # Additional validations for company formation
    add_error "Company name is required" if @company.name.blank?
    add_error "Free zone is required" if @company.free_zone.blank?
    # TODO: Re-enable document validation once document upload step is added to main workflow
    # add_error "At least one document is required" if @company.documents.empty?

    # Validate shareholder details
    @company.shareholders.each do |shareholder|
      add_error "Shareholder #{shareholder.first_name} #{shareholder.last_name} requires nationality" if shareholder.nationality.blank?
      add_error "Shareholder #{shareholder.first_name} #{shareholder.last_name} requires passport number" if shareholder.passport_number.blank?
    end

    # Validate director details (GM is typically the director)
    @company.directors.each do |director|
      add_error "Director #{director.first_name} #{director.last_name} requires nationality" if director.nationality.blank?
      add_error "Director #{director.first_name} #{director.last_name} requires passport number" if director.passport_number.blank?
    end

    errors
  end
end

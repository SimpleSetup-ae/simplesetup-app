class ApplicationMailer < ActionMailer::Base
  # Dynamic sender based on environment and configuration
  def self.sender_email
    if Rails.env.production? || ENV['ENABLE_SENDGRID'] == 'true'
      # Use verified SendGrid sender identity
      'noreply@simplesetup.ae'
    elsif ENV['ENABLE_REAL_EMAILS'] == 'true'
      # Use Gmail for development testing
      ENV['GMAIL_USERNAME'] || 'james.o.campion@gmail.com'
    else
      # Default for development (emails won't actually send)
      'dev@simplesetup.local'
    end
  end
  
  default from: sender_email
  layout 'mailer'
  
  def submission_confirmation(company)
    @company = company
    @owner = company.owner
    
    # Skip email if no owner (anonymous submission)
    return unless @owner&.email.present?
    
    mail(
      to: @owner.email,
      subject: "Application Submitted - #{company.name_options&.first || 'Your Company'}"
    )
  end
  
  def status_update(company)
    @company = company
    @owner = company.owner
    
    return unless @owner&.email.present?
    
    mail(
      to: @owner.email,
      subject: "Application Status Updated - #{company.name_options&.first || 'Your Company'}"
    )
  end
end

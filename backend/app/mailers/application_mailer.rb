class ApplicationMailer < ActionMailer::Base
  default from: 'noreply@simplesetup.ae'
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

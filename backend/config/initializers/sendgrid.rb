# SendGrid configuration for ActionMailer
# Only use SendGrid if explicitly enabled or in production
if Rails.env.production? || ENV['ENABLE_SENDGRID'] == 'true'
  ActionMailer::Base.smtp_settings = {
    user_name: 'apikey',
    password: ENV['SENDGRID_API_KEY'],
    domain: 'simplesetup.ae',
    address: 'smtp.sendgrid.net',
    port: 587,
    authentication: :plain,
    enable_starttls_auto: true
  }

  # Set delivery method to SMTP
  ActionMailer::Base.delivery_method = :smtp
  
  # Enable delivery in development for testing
  ActionMailer::Base.perform_deliveries = true
  ActionMailer::Base.raise_delivery_errors = true
end

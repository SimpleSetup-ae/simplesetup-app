# SendGrid configuration for ActionMailer
if Rails.env.production? || Rails.env.development?
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

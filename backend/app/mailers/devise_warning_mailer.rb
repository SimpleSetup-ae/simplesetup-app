class DeviseWarningMailer < ApplicationMailer
  default from: 'security@simplesetup.ae'

  def account_warning(user)
    @user = user
    @remaining_attempts = 10 - user.failed_attempts
    
    mail(
      to: user.email,
      subject: 'Security Alert: Multiple Failed Login Attempts Detected'
    )
  end
end

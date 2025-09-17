class OtpMailer < ApplicationMailer
  def send_otp(user, otp_code)
    @user = user
    @otp_code = otp_code
    @expires_in = '10 minutes'
    
    mail(
      to: user.email,
      subject: "Your SimpleSetup verification code: #{otp_code}",
      template_path: 'otp_mailer',
      template_name: 'send_otp'
    )
  end
end

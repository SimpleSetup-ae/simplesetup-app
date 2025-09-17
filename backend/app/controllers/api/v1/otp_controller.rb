class Api::V1::OtpController < Api::V1::BaseController
  skip_before_action :authenticate_user!
  
  # POST /api/v1/auth/check_user
  def check_user
    email = params[:email]&.downcase&.strip
    
    if email.blank?
      render json: {
        success: false,
        message: 'Email address is required'
      }, status: :bad_request
      return
    end
    
    user = User.find_by(email: email)
    
    render json: {
      success: true,
      exists: user.present?,
      has_password: user.present? && user.encrypted_password.present?
    }
  end
  
  # POST /api/v1/auth/register
  def register
    email = params[:email]&.downcase&.strip
    password = params[:password]
    draft_token = params[:draft_token]
    
    if email.blank? || password.blank?
      render json: {
        success: false,
        message: 'Email and password are required'
      }, status: :bad_request
      return
    end
    
    unless valid_email?(email)
      render json: {
        success: false,
        message: 'Please provide a valid email address'
      }, status: :bad_request
      return
    end
    
    # Validate password strength
    unless valid_password?(password)
      render json: {
        success: false,
        message: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      }, status: :bad_request
      return
    end
    
    # Check if user already exists
    user = User.find_by(email: email)
    if user.present?
      render json: {
        success: false,
        message: 'An account with this email already exists'
      }, status: :conflict
      return
    end
    
    # Create new user
    user = User.new(
      email: email,
      password: password,
      password_confirmation: password
    )
    
    # Skip email confirmation for now, will verify via OTP
    user.skip_confirmation!
    
    if user.save
      # Claim draft application if draft_token provided
      if draft_token.present?
        company = Company.find_by(draft_token: draft_token)
        if company&.anonymous_draft?
          company.claim_by_user!(user)
        end
      end
      
      render json: {
        success: true,
        message: 'Account created successfully',
        user_id: user.id
      }
    else
      render json: {
        success: false,
        message: 'Could not create account',
        errors: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v1/auth/send_otp
  def send_otp
    email = params[:email]&.downcase&.strip
    
    if email.blank?
      render json: {
        success: false,
        message: 'Email address is required'
      }, status: :bad_request
      return
    end
    
    unless valid_email?(email)
      render json: {
        success: false,
        message: 'Please provide a valid email address'
      }, status: :bad_request
      return
    end
    
    # Find or create user
    user = User.find_or_initialize_by(email: email)
    
    if user.new_record?
      # Create new user with temporary password
      user.password = SecureRandom.hex(16)
      user.skip_confirmation! # We'll verify via OTP instead
      
      unless user.save
        render json: {
          success: false,
          message: 'Could not create account',
          errors: user.errors.full_messages
        }, status: :unprocessable_entity
        return
      end
    end
    
    # Check rate limiting (prevent spam)
    if user.current_otp_sent_at && user.current_otp_sent_at > 1.minute.ago
      seconds_left = 60 - (Time.current - user.current_otp_sent_at).to_i
      render json: {
        success: false,
        message: "Please wait #{seconds_left} seconds before requesting a new code"
      }, status: :too_many_requests
      return
    end
    
    # Generate and send OTP
    otp_code = user.generate_otp!
    
    # Send email via SendGrid
    begin
      if Rails.env.production?
        OtpMailer.send_otp(user, otp_code).deliver_now
      else
        # In development, just log the OTP
        Rails.logger.info "OTP Code for #{email}: #{otp_code}"
      end
      
      response_data = {
        success: true,
        message: 'Verification code sent to your email',
        email: email,
        expires_in: 600 # 10 minutes
      }
      
      # In development, include the OTP code for testing
      response_data[:otp_code] = otp_code unless Rails.env.production?
      
      render json: response_data
    rescue => e
      Rails.logger.error "Failed to send OTP email: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      # In development, still return success with OTP code for testing
      if Rails.env.development?
        render json: {
          success: true,
          message: 'Email not configured - check logs for OTP code',
          email: email,
          expires_in: 600,
          otp_code: otp_code # Include OTP in development
        }
      else
        render json: {
          success: false,
          message: 'Failed to send verification code. Please try again.'
        }, status: :internal_server_error
      end
    end
  end
  
  # POST /api/v1/auth/verify_otp
  def verify_otp
    email = params[:email]&.downcase&.strip
    otp_code = params[:otp_code]&.strip
    password = params[:password]
    draft_token = params[:draft_token]
    
    if email.blank? || otp_code.blank?
      render json: {
        success: false,
        message: 'Email and verification code are required'
      }, status: :bad_request
      return
    end
    
    user = User.find_by(email: email)
    
    if user.nil?
      render json: {
        success: false,
        message: 'Invalid email or verification code'
      }, status: :unauthorized
      return
    end
    
    # If password is provided (for users who just registered), update it
    if password.present? && user.encrypted_password.blank?
      user.password = password
      user.password_confirmation = password
      user.save!
    end
    
    # Verify OTP
    if user.verify_otp(otp_code)
      # Mark user as confirmed if not already
      user.update!(confirmed_at: Time.current) unless user.confirmed?
      
      # Sign in user and generate auth token
      sign_in(:user, user)
      
      # Generate JWT token for API authentication
      token = generate_jwt_token(user)
      
      # Claim draft application if draft_token provided
      if draft_token.present?
        company = Company.find_by(draft_token: draft_token)
        if company&.anonymous_draft?
          company.claim_by_user!(user)
        end
      end
      
      render json: {
        success: true,
        message: 'Successfully verified',
        user: UserSerializer.new(user).as_json,
        token: token,
        redirect_url: draft_token.present? ? '/application/continue' : '/dashboard'
      }
    else
      render json: {
        success: false,
        message: 'Invalid or expired verification code'
      }, status: :unauthorized
    end
  end
  
  # POST /api/v1/auth/resend_otp
  def resend_otp
    send_otp # Reuse the send_otp logic
  end
  
  private
  
  def valid_email?(email)
    email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
  end
  
  def valid_password?(password)
    return false if password.length < 8
    return false unless password =~ /[A-Z]/ # Has uppercase
    return false unless password =~ /[a-z]/ # Has lowercase
    return false unless password =~ /[0-9]/ # Has number
    true
  end
  
  def generate_jwt_token(user)
    # This is a simple implementation. In production, you'd want to use
    # a proper JWT library like 'jwt' gem
    payload = {
      user_id: user.id,
      email: user.email,
      exp: 30.days.from_now.to_i
    }
    
    # For now, using a simple base64 encoding. In production, use JWT
    Base64.strict_encode64(payload.to_json)
  end
end

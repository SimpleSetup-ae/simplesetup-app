class Api::V1::OtpController < Api::V1::BaseController
  skip_before_action :authenticate_user!

  # POST /api/v1/auth/authenticate (Unified authentication endpoint)
  def authenticate
    email = params[:email]&.downcase&.strip
    password = params[:password]
    otp_code = params[:otp_code]
    draft_token = params[:draft_token]
    auth_method = params[:auth_method] || 'auto' # 'auto', 'password', 'otp', 'password_otp'

    if email.blank?
      render json: {
        success: false,
        message: 'Email address is required'
      }, status: :bad_request
      return
    end

    user = User.find_by(email: email)

    unless user
      render json: {
        success: false,
        message: 'Account not found'
      }, status: :not_found
      return
    end

    # Determine authentication method
    auth_method = determine_auth_method(auth_method, user, password.present?, otp_code.present?)

    case auth_method
    when 'password'
      authenticate_with_password(email, password, draft_token)
    when 'otp'
      authenticate_with_otp(email, otp_code, draft_token)
    when 'password_otp'
      authenticate_with_password_and_otp(email, password, otp_code, draft_token)
    else
      render json: {
        success: false,
        message: 'Invalid authentication method'
      }, status: :bad_request
    end
  end
  
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
    
    # Validate email and password using AuthValidator
    validation_errors = AuthValidator.validate(email: email, password: password)
    if validation_errors.any?
      render json: {
        success: false,
        message: validation_errors.first
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
    
    # Validate email using AuthValidator
    validation_errors = AuthValidator.validate(email: email)
    if validation_errors.any?
      render json: {
        success: false,
        message: validation_errors.first
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

  # Password-only authentication
  def authenticate_with_password(email, password, draft_token)
    if password.blank?
      render json: {
        success: false,
        message: 'Password is required'
      }, status: :bad_request
      return
    end

    user = authenticate_user_with_password(email, password)

    if user
      response_data = generate_auth_response(user, draft_token)
      response_data[:auth_method] = 'password'
      render json: response_data
    else
      render json: {
        success: false,
        message: 'Invalid email or password'
      }, status: :unauthorized
    end
  end

  # OTP-only authentication
  def authenticate_with_otp(email, otp_code, draft_token)
    if otp_code.blank?
      render json: {
        success: false,
        message: 'OTP code is required'
      }, status: :bad_request
      return
    end

    if authenticate_user_with_otp(email, otp_code)
      user = User.find_by(email: email)
      response_data = generate_auth_response(user, draft_token)
      response_data[:auth_method] = 'otp'
      render json: response_data
    else
      render json: {
        success: false,
        message: 'Invalid or expired OTP code'
      }, status: :unauthorized
    end
  end

  # Password + OTP authentication
  def authenticate_with_password_and_otp(email, password, otp_code, draft_token)
    if password.blank? || otp_code.blank?
      render json: {
        success: false,
        message: 'Both password and OTP code are required'
      }, status: :bad_request
      return
    end

    user = authenticate_user_with_password(email, password)
    unless user
      render json: {
        success: false,
        message: 'Invalid email or password'
      }, status: :unauthorized
      return
    end

    # Verify OTP as additional security layer
    if user.verify_otp(otp_code)
      response_data = generate_auth_response(user, draft_token)
      response_data[:auth_method] = 'password_otp'
      render json: response_data
    else
      render json: {
        success: false,
        message: 'Invalid OTP code'
      }, status: :unauthorized
    end
  end

  # Determine the best authentication method
  def determine_auth_method(requested_method, user, has_password, has_otp)
    case requested_method
    when 'auto'
      # Auto-determine based on user state and provided credentials
      if user.encrypted_password.present? && has_password
        has_otp ? 'password_otp' : 'password'
      elsif has_otp
        'otp'
      else
        'password' # Default to password if available
      end
    when 'password'
      has_password ? 'password' : 'otp'
    when 'otp'
      has_otp ? 'otp' : 'password'
    when 'password_otp'
      (has_password && has_otp) ? 'password_otp' : 'password'
    else
      'password'
    end
  end

  private

  # validation logic moved to AuthValidator

  def generate_jwt_token(user)
    JwtService.encode(JwtService.access_token_payload(user))
  end

  def authenticate_user_with_password(email, password)
    user = User.find_by(email: email)
    return false unless user&.valid_password?(password)

    # Check if user account is locked or needs confirmation
    return false if user.locked_at.present?
    return false if user.confirmed_at.nil? && !Rails.env.development?

    user
  end

  def authenticate_user_with_otp(email, otp_code)
    user = User.find_by(email: email)
    return false unless user&.verify_otp(otp_code)

    # Check if user account is locked
    return false if user.locked_at.present?

    user
  end

  def generate_auth_response(user, draft_token = nil)
    token = generate_jwt_token(user)

    response_data = {
      success: true,
      message: 'Successfully authenticated',
      user: UserSerializer.new(user).as_json,
      token: token,
      token_expires_at: Time.current + 48.hours,
      auth_method: 'otp'
    }

    # Claim draft application if draft_token provided
    if draft_token.present?
      company = Company.find_by(draft_token: draft_token)
      if company&.anonymous_draft?
        company.claim_by_user!(user)
        response_data[:redirect_url] = '/application/continue'
      end
    else
      response_data[:redirect_url] = '/dashboard'
    end

    response_data
  end

  def check_rate_limit(user)
    return unless user.current_otp_sent_at
    return unless user.current_otp_sent_at > 1.minute.ago

    seconds_left = 60 - (Time.current - user.current_otp_sent_at).to_i
    render json: {
      success: false,
      message: "Please wait #{seconds_left} seconds before requesting a new code",
      retry_after: seconds_left
    }, status: :too_many_requests
    true
  end
end

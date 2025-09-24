class Api::V1::InlineRegistrationsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:create, :verify_email, :update_phone]
  skip_before_action :authenticate_from_jwt_token!, only: [:create, :verify_email, :update_phone]
  
  # POST /api/v1/inline_registrations
  # Creates a new user account while preserving draft application
  def create
    # Validate input
    validation_errors = AuthValidator.validate(
      email: registration_params[:email],
      password: registration_params[:password]
    )
    
    if validation_errors.any?
      return render json: {
        success: false,
        errors: validation_errors
      }, status: :unprocessable_entity
    end
    
    # Check for existing user
    existing_user = User.find_by(email: registration_params[:email].downcase.strip)
    if existing_user
      return render json: {
        success: false,
        error: 'An account with this email already exists',
        existing_user: true
      }, status: :conflict
    end
    
    # Create new user
    user = User.new(
      email: registration_params[:email].downcase.strip,
      password: registration_params[:password],
      password_confirmation: registration_params[:password_confirmation],
      first_name: registration_params[:first_name],
      last_name: registration_params[:last_name]
    )
    
    # Skip email confirmation for now - will handle via OTP
    user.skip_confirmation!
    
    if user.save
      # Send verification OTP
      user.generate_otp!
      user.save!
      # Send OTP email via SendGrid
      begin
        Rails.logger.info "🔍 Debug - Sender email: #{ApplicationMailer.sender_email}"
        Rails.logger.info "🔍 Debug - ENABLE_SENDGRID: #{ENV['ENABLE_SENDGRID']}"
        Rails.logger.info "🔍 Debug - Rails.env: #{Rails.env}"
        
        OtpMailer.send_otp(user, user.current_otp).deliver_now
        Rails.logger.info "✅ OTP email sent to #{user.email}: #{user.current_otp}"
      rescue => e
        Rails.logger.error "❌ Failed to send OTP email: #{e.message}"
        Rails.logger.info "📧 OTP for #{user.email}: #{user.current_otp} (email failed, check logs)"
      end
      
      # Generate temporary token for next steps
      temp_token = JwtService.encode({
        user_id: user.id,
        draft_token: registration_params[:draft_token],
        step: 'email_verification',
        exp: 1.hour.from_now.to_i
      })
      
      render json: {
        success: true,
        message: 'Account created successfully',
        user: UserSerializer.new(user).as_json,
        temp_token: temp_token,
        next_step: 'email_verification',
        requires_verification: true
      }
    else
      render json: {
        success: false,
        errors: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v1/inline_registrations/verify_email
  # Verifies email via OTP code
  def verify_email
    temp_token = decode_temp_token
    return render_invalid_token unless temp_token
    
    user = User.find_by(id: temp_token['user_id'])
    return render_user_not_found unless user
    
    # Verify OTP
    if user.current_otp == params[:otp_code] && user.current_otp_sent_at > 15.minutes.ago
      # Mark email as verified
      user.confirmed_at = Time.current
      user.current_otp = nil
      user.current_otp_sent_at = nil
      user.otp_verified_at = Time.current
      user.save!
      
      # Generate new temp token for phone step
      new_temp_token = JwtService.encode({
        user_id: user.id,
        draft_token: temp_token['draft_token'] || params[:draft_token],
        step: 'phone_capture',
        exp: 1.hour.from_now.to_i
      })
      
      render json: {
        success: true,
        message: 'Email verified successfully',
        user: UserSerializer.new(user).as_json,
        temp_token: new_temp_token,
        next_step: 'phone_capture'
      }
    else
      render json: {
        success: false,
        error: 'Invalid or expired verification code'
      }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v1/inline_registrations/update_phone
  # Captures phone number and completes registration
  def update_phone
    temp_token = decode_temp_token
    return render_invalid_token unless temp_token
    
    user = User.find_by(id: temp_token['user_id'])
    return render_user_not_found unless user
    
    # Validate phone number if provided
    if params[:phone_number].present?
      phone_errors = PhoneValidator.validate(
        phone_number: params[:phone_number],
        country_code: params[:country_code]
      )
      
      if phone_errors.any?
        return render json: {
          success: false,
          errors: phone_errors
        }, status: :unprocessable_entity
      end
      
      # Format and save phone number
      formatted_phone = PhoneValidator.format_phone_number(
        params[:phone_number],
        params[:country_code]
      )
      
      user.phone_number = formatted_phone
      user.save!
    end
    
    # Generate full JWT token for authenticated session
    jwt_token = JwtService.encode({
      user_id: user.id,
      email: user.email,
      exp: 48.hours.from_now.to_i
    })
    
    # Claim draft application if draft_token provided
    claimed_application = nil
    if temp_token['draft_token'].present?
      company = Company.find_by(draft_token: temp_token['draft_token'])
      if company&.anonymous_draft?
        if company.claim_by_user!(user)
          claimed_application = {
            id: company.id,
            name: company.name,
            status: company.status
          }
        end
      end
    end
    
    render json: {
      success: true,
      message: 'Registration completed successfully',
      user: UserSerializer.new(user).as_json,
      token: jwt_token,
      token_expires_at: 48.hours.from_now,
      claimed_application: claimed_application,
      redirect_url: claimed_application ? "/application/#{claimed_application[:id]}/activities" : '/dashboard'
    }
  end
  
  # POST /api/v1/inline_registrations/resend_otp
  # Resend email verification code
  def resend_otp
    temp_token = decode_temp_token
    return render_invalid_token unless temp_token
    
    user = User.find_by(id: temp_token['user_id'])
    return render_user_not_found unless user
    
    # Rate limiting
    if user.current_otp_sent_at && user.current_otp_sent_at > 1.minute.ago
      seconds_left = 60 - (Time.current - user.current_otp_sent_at).to_i
      return render json: {
        success: false,
        error: "Please wait #{seconds_left} seconds before requesting a new code",
        retry_after: seconds_left
      }, status: :too_many_requests
    end
    
    # Generate and send new OTP
    user.generate_otp!
    user.save!
    # Send OTP email via SendGrid
    begin
      OtpMailer.send_otp(user, user.current_otp).deliver_now
      Rails.logger.info "✅ New OTP email sent to #{user.email}: #{user.current_otp}"
    rescue => e
      Rails.logger.error "❌ Failed to send OTP email: #{e.message}"
      Rails.logger.info "📧 New OTP for #{user.email}: #{user.current_otp} (email failed, check logs)"
    end
    
    render json: {
      success: true,
      message: 'Verification code sent to your email'
    }
  end
  
  # POST /api/v1/inline_registrations/skip_phone
  # Skip phone number capture for now
  def skip_phone
    temp_token = decode_temp_token
    return render_invalid_token unless temp_token
    
    user = User.find_by(id: temp_token['user_id'])
    return render_user_not_found unless user
    
    # Generate full JWT token
    jwt_token = JwtService.encode({
      user_id: user.id,
      email: user.email,
      exp: 48.hours.from_now.to_i
    })
    
    # Claim draft application if draft_token provided
    claimed_application = nil
    if temp_token['draft_token'].present?
      company = Company.find_by(draft_token: temp_token['draft_token'])
      if company&.anonymous_draft?
        if company.claim_by_user!(user)
          claimed_application = {
            id: company.id,
            name: company.name,
            status: company.status
          }
        end
      end
    end
    
    render json: {
      success: true,
      message: 'Phone number skipped',
      user: UserSerializer.new(user).as_json,
      token: jwt_token,
      token_expires_at: 48.hours.from_now,
      claimed_application: claimed_application,
      redirect_url: claimed_application ? "/application/#{claimed_application[:id]}/activities" : '/dashboard'
    }
  end
  
  private
  
  def registration_params
    params.permit(:email, :password, :password_confirmation, :first_name, :last_name, :draft_token)
  end
  
  def decode_temp_token
    token = params[:temp_token] || request.headers['X-Temp-Token']
    return nil unless token
    
    JwtService.decode(token)
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end
  
  def render_invalid_token
    render json: {
      success: false,
      error: 'Invalid or expired token'
    }, status: :unauthorized
  end
  
  def render_user_not_found
    render json: {
      success: false,
      error: 'User not found'
    }, status: :not_found
  end
end

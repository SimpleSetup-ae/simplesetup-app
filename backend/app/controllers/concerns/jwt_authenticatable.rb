module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_from_jwt_token!, unless: :skip_jwt_auth?
  end

  private

  def authenticate_from_jwt_token!
    return if skip_jwt_auth?

    # Try to get token from Authorization header first
    auth_header = request.headers['Authorization']
    token = if auth_header&.start_with?('Bearer ')
              auth_header.gsub('Bearer ', '')
            else
              # Fallback to token parameter (for development/testing)
              params[:token]
            end

    return render_unauthorized('JWT token required') if token.blank?

    payload = JwtService.decode(token)
    return render_unauthorized('Invalid JWT token') if payload.blank?

    # Check if token is expired
    return render_unauthorized('Token expired') if token_expired?(payload)

    # Find user
    user = User.find_by(id: payload['user_id'])
    return render_unauthorized('User not found') unless user

    # Check if user account is locked
    return render_unauthorized('Account locked') if user.locked_at.present?

    # Prefer Devise's warden session if available, otherwise set request-scoped user
    begin
      sign_in(:user, user, store: false) if respond_to?(:sign_in)
    rescue StandardError
      # Fallback to request-scoped assignment when warden is not available here
      @jwt_current_user = user
    else
      @jwt_current_user = user
    end
  end

  # Do NOT override Devise helpers. Prefer Devise's current_user if present.
  def current_user
    devise_user = (super() if defined?(super))
    return devise_user if devise_user.present?
    @jwt_current_user
  end

  def user_signed_in?
    # Use Devise's implementation when available
    return super() if defined?(super)
    current_user.present?
  end

  def skip_jwt_auth?
    # Skip JWT auth for specific actions that don't require authentication
    return true if self.class.skip_jwt_auth_actions&.include?(action_name.to_sym)

    # Skip for health checks and public endpoints
    controller_name == 'rails/health' || action_name == 'up'
  end

  def token_expired?(payload)
    exp = payload['exp']
    return true unless exp

    Time.at(exp) < Time.current
  end

  def render_unauthorized(message = 'Unauthorized')
    render json: {
      success: false,
      error: message,
      request_id: request.request_id || SecureRandom.uuid
    }, status: :unauthorized
  end

  module ClassMethods
    def skip_jwt_auth(*actions)
      @skip_jwt_auth_actions = actions.flatten
    end

    def skip_jwt_auth_actions
      @skip_jwt_auth_actions ||= []
    end
  end
end

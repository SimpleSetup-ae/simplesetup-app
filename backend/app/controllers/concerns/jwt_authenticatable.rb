# JWT Authentication Concern
# 
# This concern handles JWT token authentication for the inline registration flow.
# It is used ONLY when anonymous users create accounts during the application process.
# 
# Authentication Strategy:
# 1. Anonymous application flow: No authentication required
# 2. Inline registration: JWT tokens for immediate access after signup
# 3. Dashboard/Admin access: Devise session authentication (NOT handled here)

module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_from_jwt_token!, unless: :skip_jwt_auth?
  end

  private

  # Authenticate user from JWT token
  # Only called for actions that require JWT authentication
  def authenticate_from_jwt_token!
    return if skip_jwt_auth?

    # Extract JWT token from Authorization header or params
    token = extract_jwt_token
    
    if token.blank?
      render_unauthorized('Authentication required')
      return
    end

    # Decode and validate JWT token
    payload = JwtService.decode(token)
    
    if payload.blank?
      render_unauthorized('Invalid authentication token')
      return
    end

    # Check token expiration
    if token_expired?(payload)
      render_unauthorized('Authentication token expired')
      return
    end

    # Find user from JWT payload
    user = User.find_by(id: payload['user_id'])
    
    unless user
      render_unauthorized('User not found')
      return
    end

    # Check if account is locked
    if user.locked_at.present?
      render_unauthorized('Account locked')
      return
    end

    # Set current user for this request
    @jwt_current_user = user
  end

  # Override current_user to handle both JWT and Devise authentication
  def current_user
    # For actions that skip JWT, use Devise's current_user
    if skip_jwt_auth?
      super if defined?(super)
    else
      # For JWT-authenticated actions, use JWT user
      @jwt_current_user
    end
  end

  # Check if user is signed in (either via JWT or Devise)
  def user_signed_in?
    current_user.present?
  end

  # Determine if JWT authentication should be skipped
  def skip_jwt_auth?
    # Skip for actions explicitly marked to skip
    return true if self.class.skip_jwt_auth_actions&.include?(action_name.to_sym)
    
    # Skip for health checks
    controller_name == 'rails/health' || action_name == 'up'
  end

  # Extract JWT token from request
  def extract_jwt_token
    auth_header = request.headers['Authorization']
    
    if auth_header&.start_with?('Bearer ')
      auth_header.gsub('Bearer ', '')
    else
      # Fallback to token parameter for development/testing
      params[:token]
    end
  end

  # Check if JWT token is expired
  def token_expired?(payload)
    exp = payload['exp']
    return true unless exp
    
    Time.at(exp) < Time.current
  end

  # Render unauthorized response
  def render_unauthorized(message = 'Unauthorized')
    render json: {
      success: false,
      error: message,
      request_id: request.request_id || SecureRandom.uuid
    }, status: :unauthorized
  end

  module ClassMethods
    # Mark actions that should skip JWT authentication
    def skip_jwt_auth(*actions)
      @skip_jwt_auth_actions = actions.flatten
    end

    def skip_jwt_auth_actions
      @skip_jwt_auth_actions ||= []
    end
  end
end
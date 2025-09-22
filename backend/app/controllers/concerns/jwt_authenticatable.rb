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

    # Set current user
    @current_user = user
  end

  def current_user
    @current_user
  end

  def user_signed_in?
    current_user.present?
  end

  def authenticate_user!
    return if user_signed_in?

    render json: {
      success: false,
      error: 'Authentication required',
      request_id: request_id
    }, status: :unauthorized
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
      request_id: request_id
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

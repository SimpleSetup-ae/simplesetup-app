class ApplicationController < ActionController::API
  include ActionController::Cookies
  
  before_action :authenticate_request
  
  protected
  
  def authenticate_request
    token = request.headers['Authorization']&.split(' ')&.last
    
    if token.blank?
      render json: { error: 'No token provided' }, status: :unauthorized
      return
    end
    
    begin
      # Verify JWT token with Clerk
      decoded_token = ClerkService.verify_token(token)
      @current_user = User.find_or_create_by_clerk_id(decoded_token['sub'])
    rescue JWT::DecodeError, JWT::ExpiredSignature => e
      render json: { error: 'Invalid token' }, status: :unauthorized
    rescue => e
      Rails.logger.error "Authentication error: #{e.message}"
      render json: { error: 'Authentication failed' }, status: :unauthorized
    end
  end
  
  def current_user
    @current_user
  end
  
  def current_user_id
    @current_user&.id
  end
  
  # Skip authentication for health checks and webhooks
  def skip_authentication
    skip_before_action :authenticate_request
  end
end

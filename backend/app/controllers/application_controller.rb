class ApplicationController < ActionController::API
  include ActionController::Cookies
  
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  
  protected
  
  def authenticate_user!
    Rails.logger.info "authenticate_user!: user_signed_in? = #{user_signed_in?}"
    Rails.logger.info "authenticate_user!: current_user = #{current_user.inspect}"
    
    unless user_signed_in?
      render json: { error: 'Authentication required' }, status: :unauthorized
    end
  end
  
  def current_user_id
    current_user&.id
  end
  
  # Configure permitted parameters for Devise
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:first_name, :last_name])
  end
  
  # Skip authentication for health checks
  def skip_authentication
    skip_before_action :authenticate_user!
  end
end

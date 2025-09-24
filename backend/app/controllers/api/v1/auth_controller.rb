class Api::V1::AuthController < ApplicationController
  include JwtAuthenticatable

  # Use Devise session authentication instead of JWT
  skip_jwt_auth :me, :login, :sign_out
  skip_before_action :authenticate_user!, only: [:login, :me]
  
  def me
    if current_user
      render json: {
        success: true,
        user: UserSerializer.new(current_user).as_json
      }
    else
      render json: {
        success: false,
        message: 'Not authenticated'
      }, status: :unauthorized
    end
  end
  
  def login
    email = params[:email].to_s.strip.downcase
    user = User.find_for_authentication(email: email)
    
    if user&.valid_password?(params[:password])
      sign_in :user, user
      # Ensure session cookie is written for API clients
      request.session[:user_id] = user.id
      request.session_options[:skip] = false
      render json: {
        success: true,
        message: 'Logged in successfully.',
        user: UserSerializer.new(user).as_json,
        session_timeout: 24.hours.from_now
      }
    else
      render json: {
        success: false,
        message: 'Invalid email or password.'
      }, status: :unauthorized
    end
  end
  
  def sign_out
    sign_out(current_user) if current_user
    render json: {
      success: true,
      message: 'Logged out successfully.'
    }
  end
end

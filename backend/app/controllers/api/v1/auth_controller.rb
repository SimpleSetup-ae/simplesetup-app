class Api::V1::AuthController < ApplicationController
  include JwtAuthenticatable

  # IMPORTANT: This controller uses Devise session authentication exclusively
  # JWT is NOT used for sign-in/sign-out - only for inline registration flow
  # All dashboard access (admin and client) uses Devise sessions
  
  skip_jwt_auth :me, :login, :logout
  skip_before_action :authenticate_user!, only: [:login, :me]
  
  # GET /api/v1/auth/me
  # Returns current user info from Devise session
  # Used by frontend to check authentication status
  def me
    if current_user
      render json: {
        success: true,
        user: UserSerializer.new(current_user).as_json,
        is_admin: current_user.is_admin?
      }
    else
      render json: {
        success: false,
        message: 'Not authenticated'
      }, status: :unauthorized
    end
  end
  
  # POST /api/v1/auth/sign_in
  # Authenticates user with email/password and creates Devise session
  # Used by both admin and client users from /sign-in page
  def login
    email = params[:email].to_s.strip.downcase
    user = User.find_for_authentication(email: email)
    
    if user&.valid_password?(params[:password])
      # Clear any existing session and create new one
      reset_session
      sign_in :user, user
      
      # Ensure session cookie is properly set for API clients
      request.session[:user_id] = user.id
      request.session_options[:skip] = false
      
      render json: {
        success: true,
        message: 'Logged in successfully.',
        user: UserSerializer.new(user).as_json,
        is_admin: user.is_admin?,
        session_timeout: 24.hours.from_now
      }
    else
      render json: {
        success: false,
        message: 'Invalid email or password.'
      }, status: :unauthorized
    end
  end
  
  # DELETE /api/v1/auth/sign_out
  # Destroys Devise session
  def logout
    if current_user
      sign_out(:user)
      reset_session
      render json: {
        success: true,
        message: 'Logged out successfully.'
      }
    else
      render json: {
        success: false,
        message: 'Not signed in.'
      }, status: :unprocessable_entity
    end
  end
end

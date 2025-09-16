class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:sign_in]
  
  def me
    render json: {
      success: true,
      user: UserSerializer.new(current_user).as_json
    }
  end
  
  def sign_in
    user = User.find_by(email: params[:email])
    
    if user&.valid_password?(params[:password])
      sign_in(user)
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

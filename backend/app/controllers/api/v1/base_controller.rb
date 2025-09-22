class Api::V1::BaseController < ApplicationController
  include ErrorHandler
  include JwtAuthenticatable

  # Devise authentication is handled by ApplicationController
  # JWT authentication is handled by JwtAuthenticatable concern

  before_action :set_request_id

  # Skip JWT auth for authentication endpoints
  skip_jwt_auth :authenticate, :check_user, :register, :send_otp, :verify_otp, :resend_otp, :login

  private

  def current_company
    @current_company ||= current_user&.companies&.find_by(id: params[:company_id]) ||
                         current_user&.companies&.first
  end

  def ensure_company_access!
    unless current_user&.can_access_company?(current_company)
      render json: {
        success: false,
        error: 'Access denied to this company',
        request_id: request_id
      }, status: :forbidden
    end
  end

  def set_request_id
    response.headers['X-Request-ID'] = request_id
  end
end



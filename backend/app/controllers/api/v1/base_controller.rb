class Api::V1::BaseController < ApplicationController
  include ErrorHandler

  # Devise authentication is handled by ApplicationController

  before_action :set_request_id

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



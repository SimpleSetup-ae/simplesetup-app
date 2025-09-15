class Api::V1::BaseController < ApplicationController
  # Devise authentication is handled by ApplicationController
  
  private
  
  def current_company
    @current_company ||= current_user&.companies&.find_by(id: params[:company_id]) ||
                         current_user&.companies&.first
  end
  
  def ensure_company_access!
    unless current_user&.can_access_company?(current_company)
      render json: { error: 'Access denied to this company' }, status: :forbidden
    end
  end
end



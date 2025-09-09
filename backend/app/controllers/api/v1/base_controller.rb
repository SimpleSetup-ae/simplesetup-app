class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!
  
  private
  
  def authenticate_user!
    # This would integrate with Clerk authentication
    # For now, we'll use a simple token check
    token = request.headers['Authorization']&.split(' ')&.last
    
    unless token.present?
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end
    
    # Verify token with Clerk
    begin
      @current_user = ClerkService.verify_token(token)
    rescue => e
      render json: { error: 'Invalid token' }, status: :unauthorized
    end
  end
  
  def current_user
    @current_user
  end
  
  def current_company
    @current_company ||= current_user&.companies&.find_by(id: params[:company_id]) ||
                         current_user&.companies&.first
  end
end


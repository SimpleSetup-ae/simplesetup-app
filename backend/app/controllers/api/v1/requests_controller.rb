class Api::V1::RequestsController < ApplicationController
  before_action :set_request, only: [:show, :update, :approve, :reject]
  before_action :set_company, only: [:index, :create]
  before_action :authorize_request_access
  
  def index
    @requests = @company ? @company.requests : current_user_requests
    @requests = @requests.includes(:company, :requested_by)
                        .order(created_at: :desc)
                        .page(params[:page])
                        .per(params[:per_page] || 20)
    
    render json: {
      success: true,
      data: @requests.map { |request| serialize_request(request) },
      pagination: pagination_meta(@requests)
    }
  end
  
  def show
    render json: {
      success: true,
      data: serialize_request_detailed(@request)
    }
  end
  
  def create
    @request = @company.requests.build(request_params)
    @request.requested_by = current_user
    
    if @request.save
      render json: {
        success: true,
        data: serialize_request_detailed(@request),
        message: 'Request created successfully'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @request.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def update
    if @request.update(request_params)
      render json: {
        success: true,
        data: serialize_request_detailed(@request),
        message: 'Request updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @request.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def approve
    unless can_approve_request?(@request)
      return render json: {
        success: false,
        error: 'Not authorized to approve this request'
      }, status: :forbidden
    end
    
    @request.approve!
    
    render json: {
      success: true,
      data: serialize_request(@request),
      message: 'Request approved successfully'
    }
  end
  
  def reject
    unless can_approve_request?(@request)
      return render json: {
        success: false,
        error: 'Not authorized to reject this request'
      }, status: :forbidden
    end
    
    rejection_reason = params[:reason]
    @request.reject!(rejection_reason)
    
    render json: {
      success: true,
      data: serialize_request(@request),
      message: 'Request rejected'
    }
  end
  
  def submit
    @request = Request.find(params[:id])
    
    unless @request.company.can_be_accessed_by?(current_user)
      return render json: {
        success: false,
        error: 'Access denied'
      }, status: :forbidden
    end
    
    @request.submit!
    
    render json: {
      success: true,
      data: serialize_request(@request),
      message: 'Request submitted for review'
    }
  end
  
  private
  
  def set_request
    @request = Request.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Request not found'
    }, status: :not_found
  end
  
  def set_company
    @company = Company.find(params[:company_id]) if params[:company_id]
    @company ||= current_user.companies.find(params[:company_id]) if params[:company_id]
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found or access denied'
    }, status: :not_found
  end
  
  def authorize_request_access
    if @request
      unless @request.company.can_be_accessed_by?(current_user)
        render json: {
          success: false,
          error: 'Access denied'
        }, status: :forbidden
      end
    elsif @company
      unless @company.can_be_accessed_by?(current_user)
        render json: {
          success: false,
          error: 'Access denied'
        }, status: :forbidden
      end
    end
  end
  
  def current_user_requests
    # Get all requests for companies the user has access to
    company_ids = current_user.companies.pluck(:id)
    Request.joins(:company).where(company_id: company_ids)
  end
  
  def can_approve_request?(request)
    user_role = current_user.role_for_company(request.company)
    %w[owner admin csp_admin super_admin].include?(user_role)
  end
  
  def request_params
    params.require(:request).permit(
      :request_type, :title, :description, :fee_amount, :fee_currency,
      request_data: {},
      response_data: {}
    )
  end
  
  def serialize_request(request)
    {
      id: request.id,
      request_type: request.request_type,
      title: request.title,
      description: request.description,
      status: request.status,
      fee_amount: request.fee_amount,
      fee_currency: request.fee_currency,
      fee_display: request.fee_display,
      submitted_at: request.submitted_at&.iso8601,
      processed_at: request.processed_at&.iso8601,
      completed_at: request.completed_at&.iso8601,
      processing_time_days: request.processing_time_days,
      created_at: request.created_at.iso8601,
      company: {
        id: request.company.id,
        name: request.company.name,
        free_zone: request.company.free_zone
      },
      requested_by: {
        id: request.requested_by.id,
        name: request.requested_by.full_name,
        email: request.requested_by.email
      }
    }
  end
  
  def serialize_request_detailed(request)
    base_data = serialize_request(request)
    
    base_data.merge({
      request_data: request.request_data,
      response_data: request.response_data,
      notes: request.notes
    })
  end
  
  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count,
      per_page: collection.limit_value
    }
  end
end

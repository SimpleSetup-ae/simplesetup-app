class Api::V1::NotificationsController < Api::V1::BaseController
  before_action :set_notification, only: [:show, :mark_read]
  
  # GET /api/v1/notifications
  def index
    @notifications = current_user.notifications
                                .includes(:company)
                                .active
                                .recent
    
    # Filter by company if specified
    @notifications = @notifications.for_company(params[:company_id]) if params[:company_id].present?
    
    # Filter by read status
    case params[:filter]
    when 'unread'
      @notifications = @notifications.unread
    when 'read'
      @notifications = @notifications.read
    end
    
    # Pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    per_page = [per_page, 50].min # Max 50 per page
    
    @notifications = @notifications.limit(per_page).offset((page - 1) * per_page)
    
    render json: {
      success: true,
      data: @notifications.map { |notification| serialize_notification(notification) },
      meta: {
        unread_count: current_user.notifications.unread.active.count,
        total_count: current_user.notifications.active.count,
        page: page,
        per_page: per_page
      }
    }
  end
  
  # GET /api/v1/notifications/:id
  def show
    render json: {
      success: true,
      data: serialize_notification(@notification)
    }
  end
  
  # POST /api/v1/notifications/:id/mark_read
  def mark_read
    @notification.mark_as_read!
    
    render json: {
      success: true,
      data: serialize_notification(@notification),
      message: 'Notification marked as read'
    }
  end
  
  # POST /api/v1/notifications/mark_all_read
  def mark_all_read
    company_filter = params[:company_id].present? ? { company_id: params[:company_id] } : {}
    
    updated_count = current_user.notifications
                                .unread
                                .active
                                .where(company_filter)
                                .update_all(
                                  read: true, 
                                  read_at: Time.current,
                                  updated_at: Time.current
                                )
    
    render json: {
      success: true,
      data: {
        marked_read_count: updated_count,
        remaining_unread: current_user.notifications.unread.active.count
      },
      message: "#{updated_count} notifications marked as read"
    }
  end
  
  # GET /api/v1/notifications/summary
  def summary
    unread_count = current_user.notifications.unread.active.count
    
    # Group by type
    by_type = current_user.notifications
                         .unread
                         .active
                         .group(:type)
                         .count
    
    # Group by company
    by_company = current_user.notifications
                            .unread
                            .active
                            .joins(:company)
                            .group('companies.name')
                            .count
    
    render json: {
      success: true,
      data: {
        total_unread: unread_count,
        by_type: by_type,
        by_company: by_company,
        has_critical: by_type['error'].to_i > 0,
        has_warnings: by_type['warning'].to_i > 0
      }
    }
  end
  
  private
  
  def set_notification
    @notification = current_user.notifications.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Notification not found'
    }, status: :not_found
  end
  
  def serialize_notification(notification)
    {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      action_url: notification.action_url,
      read: notification.read,
      read_at: notification.read_at&.iso8601,
      created_at: notification.created_at.iso8601,
      expires_at: notification.expires_at&.iso8601,
      company: notification.company ? {
        id: notification.company.id,
        name: notification.company.name
      } : nil,
      metadata: notification.metadata
    }
  end
end

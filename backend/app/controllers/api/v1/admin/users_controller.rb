class Api::V1::Admin::UsersController < Api::V1::BaseController
  before_action :require_admin
  before_action :set_user, only: [:show, :update, :destroy, :toggle_admin, :toggle_lock]
  
  # GET /api/v1/admin/users
  def index
    @users = User.includes(:owned_companies, :company_memberships)
                 .order(created_at: :desc)
    
    # Apply filters
    @users = @users.where(is_admin: true) if params[:role] == 'admin'
    @users = @users.where(is_admin: false) if params[:role] == 'user'
    
    case params[:status]
    when 'active'
      @users = @users.where(confirmed_at: !nil, locked_at: nil)
    when 'locked'
      @users = @users.where.not(locked_at: nil)
    when 'unconfirmed'
      @users = @users.where(confirmed_at: nil)
    end
    
    # Search
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @users = @users.where(
        "first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?",
        search_term, search_term, search_term
      )
    end
    
    render json: {
      success: true,
      users: @users.map { |user| serialize_admin_user(user) },
      stats: calculate_user_stats
    }
  end
  
  # GET /api/v1/admin/users/:id
  def show
    render json: {
      success: true,
      user: serialize_detailed_admin_user(@user)
    }
  end
  
  # POST /api/v1/admin/users
  def create
    @user = User.new(user_params)
    @user.password = Devise.friendly_token[0, 20] # Generate random password
    @user.confirmed_at = Time.current if params[:auto_confirm]
    
    if @user.save
      # Send invitation email if requested
      if params[:send_invitation]
        @user.send_reset_password_instructions
      end
      
      render json: {
        success: true,
        user: serialize_admin_user(@user),
        message: 'User created successfully'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # PATCH /api/v1/admin/users/:id
  def update
    if @user.update(user_params)
      render json: {
        success: true,
        user: serialize_admin_user(@user),
        message: 'User updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v1/admin/users/:id/toggle_admin
  def toggle_admin
    @user.update!(is_admin: !@user.is_admin)
    
    render json: {
      success: true,
      user: serialize_admin_user(@user),
      message: @user.is_admin? ? 'Admin privileges granted' : 'Admin privileges revoked'
    }
  end
  
  # POST /api/v1/admin/users/:id/toggle_lock
  def toggle_lock
    if @user.locked_at?
      @user.unlock_access!
      message = 'User unlocked successfully'
    else
      @user.lock_access!
      message = 'User locked successfully'
    end
    
    render json: {
      success: true,
      user: serialize_admin_user(@user),
      message: message
    }
  end
  
  # DELETE /api/v1/admin/users/:id
  def destroy
    @user.update!(deleted_at: Time.current)
    
    render json: {
      success: true,
      message: 'User deleted successfully'
    }
  end
  
  private
  
  def set_user
    @user = User.find(params[:id])
  end
  
  def require_admin
    unless current_user&.admin?
      render json: { error: 'Admin access required' }, status: :forbidden
    end
  end
  
  def user_params
    params.require(:user).permit(:email, :first_name, :last_name, :is_admin)
  end
  
  def serialize_admin_user(user)
    {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: user.full_name,
      isAdmin: user.admin?,
      createdAt: user.created_at.iso8601,
      lastSignInAt: user.last_sign_in_at&.iso8601,
      signInCount: user.sign_in_count,
      confirmed: user.confirmed?,
      locked: user.locked_at.present?,
      companiesCount: user.owned_companies.count
    }
  end
  
  def serialize_detailed_admin_user(user)
    serialize_admin_user(user).merge(
      currentSignInAt: user.current_sign_in_at&.iso8601,
      currentSignInIp: user.current_sign_in_ip,
      lastSignInIp: user.last_sign_in_ip,
      confirmationSentAt: user.confirmation_sent_at&.iso8601,
      lockedAt: user.locked_at&.iso8601,
      failedAttempts: user.failed_attempts,
      companies: user.owned_companies.map { |company|
        {
          id: company.id,
          name: company.name,
          status: company.status,
          freeZone: company.free_zone
        }
      }
    )
  end
  
  def calculate_user_stats
    all_users = User.all
    {
      total: all_users.count,
      admins: all_users.where(is_admin: true).count,
      active: all_users.where(confirmed_at: !nil, locked_at: nil).count,
      locked: all_users.where.not(locked_at: nil).count,
      unconfirmed: all_users.where(confirmed_at: nil).count
    }
  end
end

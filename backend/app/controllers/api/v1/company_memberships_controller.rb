class Api::V1::CompanyMembershipsController < ApplicationController
  before_action :set_company, only: [:index, :create, :invite, :remove]
  before_action :set_membership, only: [:show, :update, :destroy, :accept, :reject]
  before_action :authorize_membership_access
  
  def index
    @memberships = @company.company_memberships.includes(:user)
    @pending_invitations = @company.company_invitations.pending if defined?(CompanyInvitation)
    
    render json: {
      success: true,
      data: {
        members: @memberships.map { |membership| serialize_membership(membership) },
        pending_invitations: @pending_invitations ? @pending_invitations.map { |inv| serialize_invitation(inv) } : [],
        stats: {
          total_members: @memberships.count,
          pending_count: @pending_invitations&.count || 0,
          active_count: @memberships.accepted.count
        }
      }
    }
  end
  
  def show
    render json: {
      success: true,
      data: serialize_membership_detailed(@membership)
    }
  end
  
  def create
    @membership = @company.company_memberships.build(membership_params)
    
    if @membership.save
      render json: {
        success: true,
        data: serialize_membership_detailed(@membership),
        message: 'Team member added successfully'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @membership.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def update
    if @membership.update(membership_params)
      render json: {
        success: true,
        data: serialize_membership_detailed(@membership),
        message: 'Team member updated successfully'
      }
    else
      render json: {
        success: false,
        errors: @membership.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def destroy
    # Cannot remove the owner
    if @membership.role == 'owner'
      return render json: {
        success: false,
        error: 'Cannot remove company owner'
      }, status: :forbidden
    end
    
    # Cannot remove yourself unless you're transferring ownership
    if @membership.user == current_user
      return render json: {
        success: false,
        error: 'Cannot remove yourself. Transfer ownership first.'
      }, status: :forbidden
    end
    
    @membership.destroy
    
    render json: {
      success: true,
      message: 'Team member removed successfully'
    }
  end
  
  def invite
    # For future implementation of email invitations
    render json: {
      success: false,
      error: 'Email invitations not yet implemented'
    }, status: :not_implemented
  end
  
  private
  
  def set_company
    if params[:company_id]
      @company = current_user.companies.find(params[:company_id])
    else
      # If no company_id provided, use the first company the user has access to
      @company = current_user.companies.first
    end
    
    unless @company
      render json: {
        success: false,
        error: 'Company not found or access denied'
      }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found or access denied'
    }, status: :not_found
  end
  
  def set_membership
    @membership = CompanyMembership.find(params[:id])
    @company = @membership.company
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Team member not found'
    }, status: :not_found
  end
  
  def authorize_membership_access
    return unless @company
    
    unless current_user.can_access_company?(@company)
      render json: {
        success: false,
        error: 'Access denied'
      }, status: :forbidden
    end
    
    # For modifying operations, require admin/owner role
    if %w[create update destroy invite].include?(action_name)
      user_role = current_user.role_for_company(@company)
      unless %w[owner admin].include?(user_role)
        render json: {
          success: false,
          error: 'Not authorized to manage team members'
        }, status: :forbidden
      end
    end
  end
  
  def membership_params
    params.require(:company_membership).permit(:user_id, :role)
  end
  
  def serialize_membership(membership)
    {
      id: membership.id,
      role: membership.role,
      accepted: membership.accepted?,
      accepted_at: membership.accepted_at&.iso8601,
      created_at: membership.created_at.iso8601,
      user: {
        id: membership.user.id,
        email: membership.user.email,
        full_name: membership.user.full_name,
        first_name: membership.user.first_name,
        last_name: membership.user.last_name,
        last_sign_in_at: membership.user.last_sign_in_at&.iso8601,
        sign_in_count: membership.user.sign_in_count || 0,
        confirmed: membership.user.confirmed_at.present?,
        locked: membership.user.locked_at.present?
      },
      company: {
        id: membership.company.id,
        name: membership.company.name
      }
    }
  end
  
  def serialize_membership_detailed(membership)
    base_data = serialize_membership(membership)
    
    base_data.merge({
      permissions: {
        can_manage_company: membership.can_manage_company?,
        can_view_financials: membership.can_view_financials?
      }
    })
  end
  
  def serialize_invitation(invitation)
    {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      invited_at: invitation.created_at.iso8601,
      expires_at: invitation.expires_at&.iso8601,
      status: 'pending'
    }
  end
end

class Api::V1::CompanyMembershipsController < ApplicationController
  before_action :set_company, only: [:index, :create, :invite]
  before_action :set_membership, only: [:show, :update, :destroy]
  before_action :authorize_membership_access
  
  def index
    # Handle case when user has no companies
    unless @company
      return render json: {
        success: true,
        data: {
          members: [],
          pending_invitations: [],
          stats: {
            total_members: 0,
            pending_count: 0,
            active_count: 0
          }
        }
      }
    end
    
    @memberships = @company.company_memberships.includes(:user)
    @pending_invitations = @company.company_invitations.pending if defined?(CompanyInvitation)
    
    # Build members array including the owner if they don't have a membership record
    members = []
    
    # Add the owner as a virtual membership if they exist and don't have a membership
    if @company.owner && !@memberships.exists?(user: @company.owner)
      owner_membership = serialize_owner_as_membership(@company)
      members << owner_membership if owner_membership
    end
    
    # Add all existing memberships
    members += @memberships.map { |membership| serialize_membership(membership) }
    
    # Calculate stats including the owner
    total_members = members.count
    active_count = members.count { |m| m[:accepted] }
    
    render json: {
      success: true,
      data: {
        members: members,
        pending_invitations: @pending_invitations ? @pending_invitations.map { |inv| serialize_invitation(inv) } : [],
        stats: {
          total_members: total_members,
          pending_count: @pending_invitations&.count || 0,
          active_count: active_count
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
    # Get all companies accessible to the user (owned + memberships), including owner relationship
    accessible_companies = Company.includes(:owner).where(
      'owner_id = ? OR id IN (SELECT company_id FROM company_memberships WHERE user_id = ?)', 
      current_user.id, current_user.id
    )
    
    if params[:company_id]
      @company = accessible_companies.find_by(id: params[:company_id])
      unless @company
        render json: {
          success: false,
          error: 'Company not found or access denied'
        }, status: :not_found
      end
    else
      # If no company_id provided, use the first company the user has access to
      @company = accessible_companies.first
      # For index action, we'll handle no company gracefully in the action itself
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
  
  def serialize_owner_as_membership(company)
    return nil unless company.owner
    
    {
      id: "owner-#{company.owner.id}",
      role: 'owner',
      accepted: true,
      accepted_at: company.created_at.iso8601,
      created_at: company.created_at.iso8601,
      user: {
        id: company.owner.id,
        email: company.owner.email,
        full_name: company.owner.full_name,
        first_name: company.owner.first_name,
        last_name: company.owner.last_name,
        last_sign_in_at: company.owner.last_sign_in_at&.iso8601,
        sign_in_count: company.owner.sign_in_count || 0,
        confirmed: company.owner.confirmed_at.present?,
        locked: company.owner.locked_at.present?
      },
      company: {
        id: company.id,
        name: company.name
      }
    }
  end
end

class CompanySwitchingService
  class << self
    def get_user_companies(user)
      # Get all companies the user has access to
      owned_companies = user.owned_companies.includes(:owner, :company_memberships)
      member_companies = user.companies.includes(:owner, :company_memberships)
      
      all_companies = (owned_companies + member_companies).uniq
      
      all_companies.map do |company|
        {
          id: company.id,
          name: company.name,
          trade_name: company.trade_name,
          free_zone: company.free_zone,
          status: company.status,
          license_number: company.license_number,
          user_role: user.role_for_company(company),
          is_owner: company.owner == user,
          formation_progress: company.formation_progress,
          member_count: company.company_memberships.accepted.count,
          created_at: company.created_at.iso8601,
          last_activity: get_last_activity(company)
        }
      end.sort_by { |c| [c[:is_owner] ? 0 : 1, c[:name]] }
    end
    
    def switch_company_context(user, company_id)
      company = user.companies.find(company_id)
      
      unless company.can_be_accessed_by?(user)
        return { success: false, error: 'Access denied to this company' }
      end
      
      user_role = user.role_for_company(company)
      
      {
        success: true,
        company: {
          id: company.id,
          name: company.name,
          free_zone: company.free_zone,
          status: company.status,
          user_role: user_role,
          permissions: get_role_permissions(user_role)
        }
      }
    end
    
    def invite_user_to_company(company, inviter, email, role, message = nil)
      # Check if inviter has permission to invite users
      unless can_invite_users?(inviter, company)
        return { success: false, error: 'Not authorized to invite users' }
      end
      
      # Check if user is already a member or has pending invitation
      if company.members.joins(:user).exists?(users: { email: email })
        return { success: false, error: 'User is already a member of this company' }
      end
      
      if company.company_invitations.pending.exists?(email: email)
        return { success: false, error: 'Invitation already sent to this email' }
      end
      
      # Create invitation
      invitation = company.company_invitations.create!(
        invited_by: inviter,
        email: email,
        role: role,
        message: message
      )
      
      {
        success: true,
        invitation: invitation,
        message: 'Invitation sent successfully'
      }
    end
    
    def accept_company_invitation(invitation_token, user)
      invitation = CompanyInvitation.find_by(invitation_token: invitation_token)
      
      unless invitation
        return { success: false, error: 'Invalid invitation token' }
      end
      
      if invitation.expired?
        return { success: false, error: 'Invitation has expired' }
      end
      
      unless invitation.pending?
        return { success: false, error: 'Invitation is no longer valid' }
      end
      
      # Accept the invitation
      membership = invitation.accept!(user)
      
      if membership
        {
          success: true,
          company: invitation.company,
          membership: membership,
          message: 'Successfully joined company'
        }
      else
        {
          success: false,
          error: 'Failed to accept invitation'
        }
      end
    end
    
    def get_company_members(company, current_user)
      unless can_view_members?(current_user, company)
        return { success: false, error: 'Not authorized to view members' }
      end
      
      members = company.company_memberships.accepted.includes(:user)
      pending_invitations = company.company_invitations.pending
      
      {
        success: true,
        members: members.map { |membership| serialize_member(membership) },
        pending_invitations: pending_invitations.map { |inv| serialize_invitation(inv) },
        total_members: members.count,
        pending_count: pending_invitations.count
      }
    end
    
    def remove_company_member(company, current_user, member_user_id)
      unless can_manage_members?(current_user, company)
        return { success: false, error: 'Not authorized to remove members' }
      end
      
      # Cannot remove the owner
      if company.owner_id == member_user_id
        return { success: false, error: 'Cannot remove company owner' }
      end
      
      # Cannot remove yourself unless you're transferring ownership
      if current_user.id == member_user_id
        return { success: false, error: 'Cannot remove yourself. Transfer ownership first.' }
      end
      
      membership = company.company_memberships.find_by(user_id: member_user_id)
      
      unless membership
        return { success: false, error: 'User is not a member of this company' }
      end
      
      membership.destroy
      
      {
        success: true,
        message: 'Member removed successfully'
      }
    end
    
    private
    
    def get_last_activity(company)
      # Get the most recent activity for the company
      latest_workflow = company.workflow_instances.order(updated_at: :desc).first
      latest_document = company.documents.order(updated_at: :desc).first
      latest_request = company.requests.order(updated_at: :desc).first
      
      activities = [latest_workflow, latest_document, latest_request].compact
      return nil if activities.empty?
      
      most_recent = activities.max_by(&:updated_at)
      
      {
        type: most_recent.class.name.underscore,
        description: get_activity_description(most_recent),
        timestamp: most_recent.updated_at.iso8601
      }
    end
    
    def get_activity_description(activity)
      case activity.class.name
      when 'WorkflowInstance'
        "Workflow #{activity.status}"
      when 'Document'
        "Document #{activity.name} #{activity.ocr_status}"
      when 'Request'
        "Request #{activity.title} #{activity.status}"
      else
        'Recent activity'
      end
    end
    
    def get_role_permissions(role)
      permissions = {
        'owner' => %w[all],
        'admin' => %w[manage_workflows manage_documents view_financials manage_users],
        'accountant' => %w[view_financials manage_tax_registrations view_documents],
        'viewer' => %w[view_company view_documents view_progress]
      }
      
      permissions[role] || []
    end
    
    def can_invite_users?(user, company)
      role = user.role_for_company(company)
      %w[owner admin].include?(role)
    end
    
    def can_view_members?(user, company)
      company.can_be_accessed_by?(user)
    end
    
    def can_manage_members?(user, company)
      role = user.role_for_company(company)
      %w[owner admin].include?(role)
    end
    
    def serialize_member(membership)
      {
        id: membership.user.id,
        name: membership.user.full_name,
        email: membership.user.email,
        role: membership.role,
        joined_at: membership.accepted_at&.iso8601,
        last_login: membership.user.updated_at.iso8601, # Placeholder
        status: 'active'
      }
    end
    
    def serialize_invitation(invitation)
      {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invited_by: invitation.invited_by.full_name,
        invited_at: invitation.invited_at.iso8601,
        expires_at: invitation.expires_at.iso8601,
        days_until_expiry: invitation.days_until_expiry,
        status: invitation.status
      }
    end
  end
end

class CompanyInvitation < ApplicationRecord
  belongs_to :company
  belongs_to :invited_by, class_name: 'User'
  
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, inclusion: { in: %w[admin accountant viewer] }
  validates :status, inclusion: { in: %w[pending accepted rejected expired] }
  validates :invitation_token, presence: true, uniqueness: true
  validates :email, uniqueness: { scope: :company_id, conditions: -> { where(status: 'pending') } }
  
  enum status: {
    pending: 'pending',
    accepted: 'accepted', 
    rejected: 'rejected',
    expired: 'expired'
  }
  
  enum role: {
    admin: 'admin',
    accountant: 'accountant',
    viewer: 'viewer'
  }
  
  scope :active, -> { where(status: 'pending') }
  scope :expired, -> { where('expires_at < ?', Time.current) }
  
  before_create :generate_invitation_token
  before_create :set_expiration_date
  after_create :send_invitation_email
  
  def self.cleanup_expired
    expired.update_all(status: 'expired')
  end
  
  def accept!(user)
    return false unless pending? && !expired?
    
    # Check if user is already a member
    existing_membership = company.company_memberships.find_by(user: user)
    if existing_membership
      return false # User is already a member
    end
    
    # Create company membership
    membership = company.company_memberships.create!(
      user: user,
      role: role,
      invited_at: invited_at,
      accepted_at: Time.current
    )
    
    # Update invitation status
    update!(
      status: 'accepted',
      accepted_at: Time.current
    )
    
    # Send welcome notification
    CompanyInvitationNotificationJob.perform_later(self, 'accepted')
    
    membership
  end
  
  def reject!(reason = nil)
    return false unless pending?
    
    update!(
      status: 'rejected',
      rejected_at: Time.current,
      metadata: metadata.merge(rejection_reason: reason)
    )
    
    CompanyInvitationNotificationJob.perform_later(self, 'rejected')
  end
  
  def resend!
    return false unless pending?
    
    # Update expiration date
    update!(expires_at: 7.days.from_now)
    
    # Resend email
    send_invitation_email
  end
  
  def expired?
    expires_at && expires_at < Time.current
  end
  
  def days_until_expiry
    return nil unless expires_at
    ((expires_at.to_date - Date.current) / 1.day).to_i
  end
  
  def invitation_url
    "#{ENV['FRONTEND_URL'] || 'http://localhost:3000'}/invitations/#{invitation_token}"
  end
  
  private
  
  def generate_invitation_token
    self.invitation_token = SecureRandom.urlsafe_base64(32)
  end
  
  def set_expiration_date
    self.expires_at = 7.days.from_now
    self.invited_at = Time.current
  end
  
  def send_invitation_email
    CompanyInvitationMailer.invitation_email(self).deliver_later
  end
end

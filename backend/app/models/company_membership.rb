class CompanyMembership < ApplicationRecord
  belongs_to :company
  belongs_to :user
  
  validates :role, presence: true, inclusion: { in: %w[owner admin accountant viewer csp_admin super_admin] }
  validates :user_id, uniqueness: { scope: :company_id, conditions: -> { where(deleted_at: nil) } }
  
  enum role: {
    owner: 'owner',
    admin: 'admin',
    accountant: 'accountant',
    viewer: 'viewer',
    csp_admin: 'csp_admin',
    super_admin: 'super_admin'
  }
  
  scope :active, -> { where(deleted_at: nil) }
  scope :accepted, -> { where.not(accepted_at: nil) }
  scope :pending, -> { where(accepted_at: nil) }
  
  def accepted?
    accepted_at.present?
  end
  
  def pending?
    accepted_at.nil?
  end
  
  def can_manage_company?
    %w[owner admin].include?(role)
  end
  
  def can_view_financials?
    %w[owner admin accountant].include?(role)
  end
end

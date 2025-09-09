class User < ApplicationRecord
  has_many :company_memberships, dependent: :destroy
  has_many :companies, through: :company_memberships
  has_many :owned_companies, class_name: 'Company', foreign_key: 'owner_id', dependent: :destroy
  has_many :audit_logs, dependent: :destroy
  has_many :requests, foreign_key: 'requested_by_id', dependent: :destroy
  has_many :notifications, dependent: :destroy
  
  validates :clerk_id, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  
  scope :active, -> { where.not(deleted_at: nil) }
  
  def self.find_or_create_by_clerk_id(clerk_id)
    find_or_create_by(clerk_id: clerk_id) do |user|
      # Will be populated by webhook
      user.email = "temp-#{SecureRandom.hex(8)}@example.com"
    end
  end
  
  def full_name
    [first_name, last_name].compact.join(' ').presence || email
  end
  
  def can_access_company?(company)
    company.owner == self || company_memberships.exists?(company: company)
  end
  
  def role_for_company(company)
    return 'owner' if company.owner == self
    company_memberships.find_by(company: company)&.role || 'viewer'
  end
end

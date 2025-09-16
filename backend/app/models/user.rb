class User < ApplicationRecord
  include LockableWarnings
  
  # Include default devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :trackable, :timeoutable, :lockable,
         :omniauthable, omniauth_providers: [:google_oauth2, :linkedin]

  has_many :company_memberships, dependent: :destroy
  has_many :companies, through: :company_memberships
  has_many :owned_companies, class_name: 'Company', foreign_key: 'owner_id', dependent: :destroy
  has_many :audit_logs, dependent: :destroy
  has_many :requests, foreign_key: 'requested_by_id', dependent: :destroy
  
  validates :email, presence: true, uniqueness: true
  
  scope :active, -> { where.not(deleted_at: nil) }
  
  # OAuth methods
  def self.from_omniauth(auth)
    where(email: auth.info.email).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.first_name = auth.info.first_name
      user.last_name = auth.info.last_name
      user.provider = auth.provider
      user.uid = auth.uid
      user.confirmed_at = Time.current # Auto-confirm OAuth users
      
      # Store OAuth tokens
      case auth.provider
      when 'google_oauth2'
        user.google_token = auth.credentials.token
      when 'linkedin'
        user.linkedin_token = auth.credentials.token
      end
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

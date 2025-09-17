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
  # has_many :audit_logs, dependent: :destroy # TODO: Create AuditLog model
  has_many :requests, foreign_key: 'requested_by_id', dependent: :destroy
  
  validates :email, presence: true, uniqueness: true
  
  scope :active, -> { where.not(deleted_at: nil) }
  scope :admins, -> { where(is_admin: true) }
  
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
  
  # OTP Methods for email-based authentication
  def generate_otp!
    self.current_otp = generate_otp_code
    self.current_otp_sent_at = Time.current
    save!
    current_otp
  end
  
  def verify_otp(code)
    return false if current_otp.blank? || code.blank?
    return false if otp_expired?
    
    if current_otp == code.to_s
      self.otp_verified_at = Time.current
      self.current_otp = nil
      self.current_otp_sent_at = nil
      save!
      true
    else
      false
    end
  end
  
  def otp_expired?
    return true if current_otp_sent_at.blank?
    current_otp_sent_at < 10.minutes.ago
  end
  
  def send_otp_email!
    otp_code = generate_otp!
    UserMailer.otp_authentication(self, otp_code).deliver_later
  end
  
  # Admin check
  def admin?
    is_admin == true
  end
  
  # Check if user can manage applications
  def can_manage_applications?
    is_admin?
  end
  
  private
  
  def generate_otp_code
    # Generate 6-digit OTP code
    SecureRandom.random_number(900000) + 100000
  end
  
  # Translation limit methods
  def increment_translation_count!
    reset_translation_counter_if_needed!
    increment!(:translation_requests_count)
  end
  
  def reset_translation_counter_if_needed!
    # Reset monthly (30 days)
    if translation_requests_reset_at.nil? || translation_requests_reset_at < Time.current
      update!(
        translation_requests_count: 0,
        translation_requests_reset_at: 30.days.from_now
      )
    end
  end
  
  def remaining_translation_requests
    reset_translation_counter_if_needed!
    [0, 100 - translation_requests_count].max
  end
  
  def translation_limit_exceeded?
    translation_requests_count >= 100
  end
end

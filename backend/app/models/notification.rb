class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :company, optional: true
  
  validates :title, presence: true
  validates :message, presence: true
  validates :type, presence: true, inclusion: { in: %w[info warning error success] }
  
  enum notification_type: {
    info: 'info',
    warning: 'warning', 
    error: 'error',
    success: 'success'
  }
  
  scope :unread, -> { where(read: false) }
  scope :read, -> { where(read: true) }
  scope :active, -> { where('expires_at IS NULL OR expires_at > ?', Time.current) }
  scope :recent, -> { order(created_at: :desc) }
  scope :for_company, ->(company) { where(company: company) }
  
  def mark_as_read!
    update!(read: true, read_at: Time.current)
  end
  
  def expired?
    expires_at.present? && expires_at < Time.current
  end
  
  def self.create_for_company(company, type:, title:, message:, action_url: nil, metadata: {})
    # Notify all company members
    company.members.find_each do |user|
      create!(
        user: user,
        company: company,
        type: type,
        title: title,
        message: message,
        action_url: action_url,
        metadata: metadata
      )
    end
  end
  
  def self.create_passport_expiry_warning(person)
    return unless person.passport_expiry_date.present?
    
    days_until_expiry = (person.passport_expiry_date - Date.current).to_i
    
    if days_until_expiry <= 90 && days_until_expiry > 0
      create_for_company(
        person.company,
        type: 'warning',
        title: 'Passport Expiry Warning',
        message: "#{person.full_name}'s passport expires in #{days_until_expiry} days (#{person.passport_expiry_date.strftime('%B %d, %Y')}). Please renew to avoid formation delays.",
        action_url: "/companies/#{person.company.id}/people/#{person.id}",
        metadata: { person_id: person.id, days_until_expiry: days_until_expiry }
      )
    elsif days_until_expiry <= 0
      create_for_company(
        person.company,
        type: 'error',
        title: 'Passport Expired',
        message: "#{person.full_name}'s passport has expired (#{person.passport_expiry_date.strftime('%B %d, %Y')}). Immediate renewal required.",
        action_url: "/companies/#{person.company.id}/people/#{person.id}",
        metadata: { person_id: person.id, days_overdue: days_until_expiry.abs }
      )
    end
  end
  
  def self.create_license_renewal_reminder(company)
    return unless company.license_renewal_date.present?
    
    days_until_renewal = (company.license_renewal_date.to_date - Date.current).to_i
    
    if days_until_renewal <= 60 && days_until_renewal > 0
      create_for_company(
        company,
        type: 'warning',
        title: 'License Renewal Due',
        message: "#{company.name} license renewal is due in #{days_until_renewal} days (#{company.license_renewal_date.strftime('%B %d, %Y')}).",
        action_url: "/companies/#{company.id}/renewal",
        metadata: { days_until_renewal: days_until_renewal }
      )
    end
  end
end

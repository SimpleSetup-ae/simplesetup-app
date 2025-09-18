class Person < ApplicationRecord
  belongs_to :company
  
  # Disable Single Table Inheritance since we use 'type' column for person type
  self.inheritance_column = :_type_disabled
  
  validates :type, presence: true, inclusion: { in: %w[shareholder director signatory] }
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :share_percentage, 
    numericality: { greater_than: 0, less_than_or_equal_to: 100 }, 
    if: :shareholder?
  
  # Note: Using 'type' column for person type, but Rails STI conflicts with enums on 'type' column
  # So we use manual methods instead of enum
  
  scope :shareholders, -> { where(type: 'shareholder') }
  scope :directors, -> { where(type: 'director') }
  scope :signatories, -> { where(type: 'signatory') }
  
  def full_name
    "#{first_name} #{last_name}"
  end
  
  def shareholder?
    type == 'shareholder'
  end
  
  def director?
    type == 'director'
  end
  
  def signatory?
    type == 'signatory'
  end
  
  def has_valid_identification?
    passport_number.present? || emirates_id.present?
  end
  
  def identification_number
    emirates_id.presence || passport_number
  end
  
  def identification_type
    return 'Emirates ID' if emirates_id.present?
    return 'Passport' if passport_number.present?
    'None'
  end
  
  def passport_expiry_status
    return 'no_passport' unless passport_expiry_date
    
    days_until_expiry = (passport_expiry_date - Date.current).to_i
    
    if days_until_expiry < 0
      'expired'
    elsif days_until_expiry <= 30
      'expiring_soon'
    elsif days_until_expiry <= 90
      'expiring_within_3_months'
    else
      'valid'
    end
  end
  
  # Validation for total shareholding
  def self.validate_total_shareholding(company)
    total = company.people.shareholders.sum(:share_percentage)
    return true if total <= 100
    
    errors.add(:share_percentage, "Total shareholding cannot exceed 100%. Current total: #{total}%")
    false
  end
end

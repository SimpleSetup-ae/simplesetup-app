class Person < ApplicationRecord
  belongs_to :company
  
  validates :type, presence: true, inclusion: { in: %w[shareholder director signatory] }
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :share_percentage, 
    numericality: { greater_than: 0, less_than_or_equal_to: 100 }, 
    if: :shareholder?
  
  enum person_type: {
    shareholder: 'shareholder',
    director: 'director',
    signatory: 'signatory'
  }
  
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
  
  # Validation for total shareholding
  def self.validate_total_shareholding(company)
    total = company.people.shareholders.sum(:share_percentage)
    return true if total <= 100
    
    errors.add(:share_percentage, "Total shareholding cannot exceed 100%. Current total: #{total}%")
    false
  end
end

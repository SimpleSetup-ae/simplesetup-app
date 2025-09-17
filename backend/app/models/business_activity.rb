class BusinessActivity < ApplicationRecord
  validates :freezone, presence: true
  validates :activity_code, presence: true, uniqueness: true
  validates :activity_name, presence: true
  validates :activity_type, inclusion: { in: ['Professional', 'Commercial'] }
  validates :regulation_type, inclusion: { in: ['Regulated', 'Non-Regulated'] }

  scope :by_freezone, ->(freezone) { where(freezone: freezone) }
  scope :by_type, ->(type) { where(activity_type: type) }
  scope :regulated, -> { where(regulation_type: 'Regulated') }
  scope :non_regulated, -> { where(regulation_type: 'Non-Regulated') }
  scope :search_by_name, ->(query) { where('activity_name ILIKE ?', "%#{query}%") }
  scope :search_by_description, ->(query) { where('activity_description ILIKE ?', "%#{query}%") }

  def regulated?
    regulation_type == 'Regulated'
  end

  def professional?
    activity_type == 'Professional'
  end

  def commercial?
    activity_type == 'Commercial'
  end
  
  # First 3 business activities are free, additional ones incur fees
  def self.is_free_activity?(activity_code, position = nil)
    # If we know the position in the selection, first 3 are free
    return position <= 3 if position
    
    # Otherwise check against common free activity codes
    # This list can be configured based on business rules
    free_activity_codes = [
      'PROF-001', 'PROF-002', 'PROF-003',  # Common professional activities
      'COMM-001', 'COMM-002', 'COMM-003'   # Common commercial activities
    ]
    
    free_activity_codes.include?(activity_code)
  end
  
  def requires_approval?
    regulated? || approving_entity_1.present? || approving_entity_2.present?
  end
  
  def approval_entities
    [approving_entity_1, approving_entity_2].compact.reject(&:blank?)
  end
end

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
end

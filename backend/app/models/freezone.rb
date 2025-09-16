class Freezone < ApplicationRecord
  validates :name, presence: true
  validates :code, presence: true, uniqueness: true
  validates :active, inclusion: { in: [true, false] }
  
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  
  def self.by_code(code)
    find_by(code: code.to_s.upcase)
  end
  
  def active?
    active
  end
  
  def inactive?
    !active
  end
end

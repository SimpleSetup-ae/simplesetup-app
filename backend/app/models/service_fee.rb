class ServiceFee < ApplicationRecord
  belongs_to :pricing_catalog
  
  CATEGORIES = %w[preapproval deposit visa work_permit document amendment cancellation other penalty].freeze
  
  validates :code, presence: true
  validates :label, presence: true
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true
  validates :active, inclusion: { in: [true, false] }
  
  scope :active, -> { where(active: true) }
  scope :by_code, ->(code) { where(code: code) }
  scope :by_category, ->(category) { where(category: category) }
  
  def self.find_by_code(code)
    find_by(code: code)
  end
end

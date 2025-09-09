class GovernmentFee < ApplicationRecord
  belongs_to :pricing_catalog
  
  validates :code, presence: true
  validates :label, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true
  validates :fee_type, inclusion: { in: %w[initial renewal amendment] }
  validates :active, inclusion: { in: [true, false] }
  
  scope :active, -> { where(active: true) }
  scope :by_code, ->(code) { where(code: code) }
  scope :by_fee_type, ->(type) { where(fee_type: type) }
  
  def self.find_by_code(code)
    find_by(code: code)
  end
end

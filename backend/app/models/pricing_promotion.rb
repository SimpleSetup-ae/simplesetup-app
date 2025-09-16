class PricingPromotion < ApplicationRecord
  belongs_to :pricing_catalog
  
  APPLIES_TO_OPTIONS = %w[new_licenses renewals all].freeze
  PROMOTION_TYPES = %w[waived_fee discount_percentage discount_amount].freeze
  
  validates :key, presence: true
  validates :title, presence: true
  validates :applies_to, presence: true, inclusion: { in: APPLIES_TO_OPTIONS }
  validates :promotion_type, presence: true, inclusion: { in: PROMOTION_TYPES }
  validates :discount_value, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :active, inclusion: { in: [true, false] }
  
  scope :active, -> { where(active: true) }
  scope :current, -> { where('valid_from <= ? AND (valid_until IS NULL OR valid_until >= ?)', Time.current, Time.current) }
  scope :by_applies_to, ->(applies_to) { where(applies_to: applies_to) }
  
  def current?
    return false unless valid_from&.<= Time.current
    valid_until.nil? || valid_until >= Time.current
  end
  
  def expired?
    !current?
  end
end

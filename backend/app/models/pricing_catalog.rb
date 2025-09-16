class PricingCatalog < ApplicationRecord
  belongs_to :freezone
  has_many :license_packages, dependent: :destroy
  has_many :business_activity_fees, dependent: :destroy
  has_many :shareholding_fees, dependent: :destroy
  has_many :government_fees, dependent: :destroy
  has_many :service_fees, dependent: :destroy
  has_many :pricing_promotions, dependent: :destroy
  
  validates :currency, presence: true
  validates :version, presence: true
  validates :active, inclusion: { in: [true, false] }
  
  scope :active, -> { where(active: true) }
  scope :for_freezone, ->(freezone) { where(freezone: freezone) }
  scope :current, -> { where('effective_from <= ? AND (effective_until IS NULL OR effective_until >= ?)', Time.current, Time.current) }
  
  def current?
    return false unless effective_from&.<= Time.current
    effective_until.nil? || effective_until >= Time.current
  end
  
  def expired?
    !current?
  end
end

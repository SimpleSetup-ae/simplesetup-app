class LicensePackage < ApplicationRecord
  belongs_to :pricing_catalog
  
  validates :package_type, presence: true
  validates :duration_years, presence: true, numericality: { greater_than: 0 }
  validates :visas_included, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :price_vat_inclusive, presence: true, numericality: { greater_than: 0 }
  validates :active, inclusion: { in: [true, false] }
  
  scope :active, -> { where(active: true) }
  scope :by_package_type, ->(type) { where(package_type: type) }
  scope :by_duration, ->(years) { where(duration_years: years) }
  scope :by_visas, ->(count) { where(visas_included: count) }
  
  def calculate_vat_exclusive_price
    return price_vat_exclusive if price_vat_exclusive.present?
    
    vat_multiplier = 1 + (vat_rate || 0.05)
    (price_vat_inclusive / vat_multiplier).round(2)
  end
  
  def vat_amount
    price_vat_inclusive - calculate_vat_exclusive_price
  end
end

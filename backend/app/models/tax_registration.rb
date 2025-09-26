class TaxRegistration < ApplicationRecord
  belongs_to :company
  
  validates :registration_type, presence: true, inclusion: { 
    in: %w[corporate_tax vat excise] 
  }
  validates :status, inclusion: { 
    in: %w[not_registered pending_application under_review approved rejected active suspended cancelled] 
  }
  validates :registration_type, uniqueness: { scope: :company_id }
  validates :trn_number, uniqueness: true, allow_blank: true
  validates :annual_turnover, numericality: { greater_than_or_equal_to: 0 }, allow_blank: true
  
  enum status: {
    not_registered: 'not_registered',
    pending_application: 'pending_application',
    under_review: 'under_review',
    approved: 'approved',
    rejected: 'rejected',
    active: 'active',
    suspended: 'suspended',
    cancelled: 'cancelled'
  }
  
  enum registration_type: {
    corporate_tax: 'corporate_tax',
    vat: 'vat',
    excise: 'excise'
  }
  
  enum tax_period: {
    monthly: 'monthly',
    quarterly: 'quarterly',
    annual: 'annual'
  }
  
  scope :active_registrations, -> { where(status: 'active') }
  scope :pending_registrations, -> { where(status: ['pending_application', 'under_review']) }
  
  def self.required_for_company?(company, registration_type)
    case registration_type
    when 'corporate_tax'
      # All UAE companies need corporate tax registration
      true
    when 'vat'
      # VAT required if annual turnover > 375,000 AED
      company.estimated_annual_turnover.to_f > 375000
    when 'excise'
      # Excise tax for specific activities only
      company.activity_codes&.any? { |code| excise_required_activities.include?(code) }
    else
      false
    end
  end
  
  def self.excise_required_activities
    # Activities that require excise tax registration
    %w[
      tobacco_products
      carbonated_drinks
      energy_drinks
      sweetened_drinks
    ]
  end
  
  def registration_required?
    TaxRegistration.required_for_company?(company, registration_type)
  end
  
  def can_apply?
    not_registered? && company.status == 'issued'
  end
  
  def can_file_return?
    active? && next_filing_date.present? && next_filing_date <= Date.current
  end
  
  def is_overdue?
    next_filing_date && next_filing_date < Date.current
  end
  
  def days_until_filing
    return nil unless next_filing_date
    (next_filing_date - Date.current).to_i
  end
  
  def apply_for_registration!(application_data = {})
    update!(
      status: 'pending_application',
      applied_at: Time.current,
      registration_details: registration_details.merge(application_data)
    )
    
    # Create workflow for tax registration process
    WorkflowService.start_tax_registration_workflow(company, self)
    
    # Send notification
    TaxRegistrationNotificationJob.perform_later(self, 'application_submitted')
  end
  
  def approve_registration!(trn_number, effective_date = Date.current)
    update!(
      status: 'active',
      trn_number: trn_number,
      registration_date: Date.current,
      effective_date: effective_date,
      approved_at: Time.current,
      next_filing_date: calculate_next_filing_date
    )
    
    TaxRegistrationNotificationJob.perform_later(self, 'registration_approved')
  end
  
  def reject_registration!(reason)
    update!(
      status: 'rejected',
      rejected_at: Time.current,
      rejection_reason: reason
    )
    
    TaxRegistrationNotificationJob.perform_later(self, 'registration_rejected')
  end
  
  def file_return!(filing_data)
    # Add filing to history
    new_filing = {
      filing_date: Date.current,
      period: filing_data[:period],
      amount: filing_data[:amount],
      status: 'filed',
      reference: filing_data[:reference]
    }
    
    update!(
      filing_history: filing_history + [new_filing],
      next_filing_date: calculate_next_filing_date
    )
    
    TaxRegistrationNotificationJob.perform_later(self, 'return_filed')
  end
  
  def get_filing_requirements
    case registration_type
    when 'corporate_tax'
      {
        frequency: 'annual',
        deadline: 'Within 9 months of financial year end',
        forms: ['Corporate Tax Return'],
        threshold: 'All companies with business income'
      }
    when 'vat'
      {
        frequency: tax_period || 'quarterly',
        deadline: '28 days after end of tax period',
        forms: ['VAT Return'],
        threshold: 'Annual turnover > 375,000 AED'
      }
    when 'excise'
      {
        frequency: 'monthly',
        deadline: '15th of following month',
        forms: ['Excise Tax Return'],
        threshold: 'Activities involving excise goods'
      }
    end
  end
  
  private
  
  def calculate_next_filing_date
    return nil unless active?
    
    case registration_type
    when 'corporate_tax'
      # Annual filing - 9 months after financial year end
      company.financial_year_end&.next_year&.+ 9.months
    when 'vat'
      case tax_period
      when 'monthly'
        Date.current.end_of_month + 28.days
      when 'quarterly'
        Date.current.end_of_quarter + 28.days
      else
        Date.current.end_of_year + 28.days
      end
    when 'excise'
      # Monthly filing by 15th of following month
      Date.current.next_month.beginning_of_month + 14.days
    end
  end
end

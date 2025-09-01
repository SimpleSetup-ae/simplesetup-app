class BillingAccount < ApplicationRecord
  belongs_to :company
  has_many :payments, through: :company
  
  validates :billing_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :currency, inclusion: { in: %w[AED USD] }
  validates :account_balance, numericality: { greater_than_or_equal_to: 0 }
  
  scope :active, -> { where(deleted_at: nil) }
  
  after_create :create_stripe_customer
  
  def create_stripe_customer!
    return if stripe_customer_id.present?
    
    customer = StripeService.create_customer(
      email: billing_email || company.owner.email,
      name: company.name,
      metadata: {
        company_id: company.id,
        billing_account_id: id
      }
    )
    
    update!(stripe_customer_id: customer.id)
    customer
  end
  
  def stripe_customer
    return nil unless stripe_customer_id
    @stripe_customer ||= StripeService.get_customer(stripe_customer_id)
  end
  
  def has_payment_method?
    default_payment_method_id.present?
  end
  
  def total_paid
    company.payments.where(status: 'succeeded').sum(:amount)
  end
  
  def total_pending
    company.payments.where(status: ['pending', 'processing']).sum(:amount)
  end
  
  def can_charge?(amount)
    # Add any business logic for charging limits
    amount > 0 && amount <= 50000 # Max 50,000 AED per transaction
  end
  
  def formatted_balance
    "#{account_balance} #{currency}"
  end
  
  private
  
  def create_stripe_customer
    CreateStripeCustomerJob.perform_later(self)
  end
end

class Payment < ApplicationRecord
  belongs_to :company
  belongs_to :workflow_step, optional: true
  
  validates :payment_type, presence: true, inclusion: { 
    in: %w[formation_fee service_fee tax_registration amendment_fee visa_fee other] 
  }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, inclusion: { in: %w[AED USD] }
  validates :status, inclusion: { 
    in: %w[pending processing succeeded failed cancelled refunded] 
  }
  
  enum status: {
    pending: 'pending',
    processing: 'processing',
    succeeded: 'succeeded',
    failed: 'failed',
    cancelled: 'cancelled',
    refunded: 'refunded'
  }
  
  enum payment_type: {
    formation_fee: 'formation_fee',
    service_fee: 'service_fee', 
    tax_registration: 'tax_registration',
    amendment_fee: 'amendment_fee',
    visa_fee: 'visa_fee',
    other: 'other'
  }
  
  scope :successful, -> { where(status: 'succeeded') }
  scope :failed, -> { where(status: 'failed') }
  scope :pending, -> { where(status: ['pending', 'processing']) }
  
  after_update :handle_status_change, if: :saved_change_to_status?
  
  def stripe_payment_intent
    return nil unless stripe_payment_intent_id
    @stripe_payment_intent ||= StripeService.get_payment_intent(stripe_payment_intent_id)
  end
  
  def formatted_amount
    "#{amount} #{currency}"
  end
  
  def processing_time
    return nil unless paid_at && created_at
    ((paid_at - created_at) / 1.minute).round
  end
  
  def can_be_refunded?
    succeeded? && refunded_at.nil? && created_at > 30.days.ago
  end
  
  def can_be_cancelled?
    pending? || processing?
  end
  
  def mark_as_paid!
    update!(
      status: 'succeeded',
      paid_at: Time.current
    )
  end
  
  def mark_as_failed!(reason = nil)
    update!(
      status: 'failed',
      failed_at: Time.current,
      failure_reason: reason
    )
  end
  
  def process_refund!(refund_amount = nil)
    refund_amount ||= amount
    
    result = StripeService.create_refund(stripe_payment_intent_id, refund_amount)
    
    if result[:success]
      update!(
        status: 'refunded',
        refunded_at: Time.current,
        refund_amount: refund_amount
      )
    end
    
    result
  end
  
  private
  
  def handle_status_change
    case status
    when 'succeeded'
      # Complete workflow step if this payment was for a workflow
      if workflow_step && workflow_step.requires_payment?
        WorkflowService.complete_step(workflow_step, {
          payment_id: id,
          amount_paid: formatted_amount,
          paid_at: paid_at&.iso8601
        })
      end
      
      # Send payment confirmation
      PaymentNotificationJob.perform_later(self, 'succeeded')
      
    when 'failed'
      # Send payment failure notification
      PaymentNotificationJob.perform_later(self, 'failed')
      
    when 'refunded'
      # Send refund notification
      PaymentNotificationJob.perform_later(self, 'refunded')
    end
  end
end

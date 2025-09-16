class Request < ApplicationRecord
  belongs_to :company
  belongs_to :requested_by, class_name: 'User'
  
  validates :request_type, presence: true, inclusion: { 
    in: %w[name_change shareholder_change activity_change noc_letter amendment other] 
  }
  validates :status, inclusion: { in: %w[pending in_review approved rejected completed cancelled] }
  validates :title, presence: true
  
  enum status: {
    pending: 'pending',
    in_review: 'in_review',
    approved: 'approved',
    rejected: 'rejected',
    completed: 'completed',
    cancelled: 'cancelled'
  }
  
  enum request_type: {
    name_change: 'name_change',
    shareholder_change: 'shareholder_change',
    activity_change: 'activity_change',
    noc_letter: 'noc_letter',
    amendment: 'amendment',
    other: 'other'
  }
  
  scope :active, -> { where.not(status: ['completed', 'cancelled', 'rejected']) }
  scope :recent, -> { order(created_at: :desc) }
  
  def submit!
    update!(status: 'pending', submitted_at: Time.current)
    # Trigger notification to CSP admin
    RequestNotificationJob.perform_later(self)
  end
  
  def approve!
    update!(status: 'approved', processed_at: Time.current)
    # Create workflow if needed
    create_workflow_if_needed
  end
  
  def reject!(reason = nil)
    update!(
      status: 'rejected', 
      processed_at: Time.current,
      response_data: response_data.merge(rejection_reason: reason)
    )
  end
  
  def complete!
    update!(status: 'completed', completed_at: Time.current)
  end
  
  def cancel!
    update!(status: 'cancelled')
  end
  
  def has_fee?
    fee_amount.present? && fee_amount > 0
  end
  
  def fee_display
    return 'Free' unless has_fee?
    "#{fee_amount} #{fee_currency}"
  end
  
  def processing_time_days
    return nil unless submitted_at && processed_at
    (processed_at - submitted_at) / 1.day
  end
  
  private
  
  def create_workflow_if_needed
    # Some requests might trigger workflows
    case request_type
    when 'amendment'
      WorkflowService.start_amendment_workflow(company, self)
    end
  end
end

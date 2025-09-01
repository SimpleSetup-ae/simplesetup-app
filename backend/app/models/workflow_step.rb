class WorkflowStep < ApplicationRecord
  belongs_to :workflow_instance
  has_many :documents, dependent: :destroy
  
  validates :step_number, presence: true, uniqueness: { scope: :workflow_instance_id }
  validates :step_type, inclusion: { in: %w[FORM DOC_UPLOAD AUTO REVIEW PAYMENT ISSUANCE NOTIFY] }
  validates :status, inclusion: { in: %w[pending in_progress completed failed skipped] }
  validates :title, presence: true
  
  enum status: {
    pending: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
    failed: 'failed',
    skipped: 'skipped'
  }
  
  enum step_type: {
    form: 'FORM',
    doc_upload: 'DOC_UPLOAD',
    auto: 'AUTO',
    review: 'REVIEW',
    payment: 'PAYMENT',
    issuance: 'ISSUANCE',
    notify: 'NOTIFY'
  }
  
  scope :completed, -> { where(status: 'completed') }
  scope :pending, -> { where(status: 'pending') }
  
  def start!
    update!(status: 'in_progress', started_at: Time.current)
  end
  
  def complete!(completion_data = {})
    update!(
      status: 'completed',
      completed_at: Time.current,
      data: data.merge(completion_data)
    )
    
    # Auto-advance workflow if this was the current step
    if workflow_instance.current_step == step_number
      workflow_instance.next_step!
    end
  end
  
  def fail!(error_message)
    update!(
      status: 'failed',
      error_message: error_message
    )
  end
  
  def skip!(reason = nil)
    update!(
      status: 'skipped',
      completed_at: Time.current,
      data: data.merge(skip_reason: reason)
    )
    
    if workflow_instance.current_step == step_number
      workflow_instance.next_step!
    end
  end
  
  def can_be_completed?
    status.in?(%w[pending in_progress])
  end
  
  def requires_documents?
    step_type == 'DOC_UPLOAD'
  end
  
  def requires_payment?
    step_type == 'PAYMENT'
  end
  
  def is_automated?
    step_type == 'AUTO'
  end
end

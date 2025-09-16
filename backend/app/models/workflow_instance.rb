class WorkflowInstance < ApplicationRecord
  belongs_to :company
  has_many :workflow_steps, dependent: :destroy
  
  validates :workflow_type, presence: true
  validates :status, inclusion: { in: %w[pending in_progress completed failed cancelled] }
  
  enum status: {
    pending: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled'
  }
  
  enum workflow_type: {
    company_formation: 'company_formation',
    tax_registration: 'tax_registration',
    visa_processing: 'visa_processing',
    amendment: 'amendment'
  }
  
  scope :active, -> { where.not(status: ['completed', 'cancelled']) }
  
  def current_step_instance
    workflow_steps.find_by(step_number: current_step)
  end
  
  def next_step!
    self.current_step += 1
    save!
    current_step_instance
  end
  
  def progress_percentage
    return 0 if workflow_steps.empty?
    completed_steps = workflow_steps.where(status: 'completed').count
    (completed_steps.to_f / workflow_steps.count * 100).round
  end
  
  def can_proceed?
    current_step_instance&.status == 'completed'
  end
  
  def start!
    update!(status: 'in_progress', started_at: Time.current)
  end
  
  def complete!
    update!(status: 'completed', completed_at: Time.current)
  end
  
  def fail!(error_message = nil)
    update!(status: 'failed')
    current_step_instance&.update(status: 'failed', error_message: error_message)
  end
end

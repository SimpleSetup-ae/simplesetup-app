class Company < ApplicationRecord
  belongs_to :owner, class_name: 'User'
  has_many :company_memberships, dependent: :destroy
  has_many :members, through: :company_memberships, source: :user
  has_many :workflow_instances, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :people, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :requests, dependent: :destroy
  has_many :tax_registrations, dependent: :destroy
  has_one :billing_account, dependent: :destroy
  
  # Specific person types
  has_many :shareholders, -> { where(type: 'shareholder') }, class_name: 'Person'
  has_many :directors, -> { where(type: 'director') }, class_name: 'Person'
  has_many :signatories, -> { where(type: 'signatory') }, class_name: 'Person'
  
  validates :name, presence: true
  validates :free_zone, presence: true
  validates :status, inclusion: { in: %w[draft in_progress pending_payment processing approved rejected issued] }
  
  enum status: {
    draft: 'draft',
    in_progress: 'in_progress',
    pending_payment: 'pending_payment',
    processing: 'processing',
    approved: 'approved',
    rejected: 'rejected',
    issued: 'issued'
  }
  
  scope :active, -> { where.not(status: 'rejected') }
  scope :by_free_zone, ->(zone) { where(free_zone: zone) }
  
  after_create :create_billing_account
  after_create :start_formation_workflow
  
  def current_workflow
    workflow_instances.where(workflow_type: 'company_formation').order(created_at: :desc).first
  end
  
  def formation_progress
    return 0 unless current_workflow
    
    total_steps = current_workflow.workflow_steps.count
    completed_steps = current_workflow.workflow_steps.where(status: 'completed').count
    
    return 0 if total_steps.zero?
    (completed_steps.to_f / total_steps * 100).round
  end
  
  def can_be_accessed_by?(user)
    owner == user || members.include?(user)
  end
  
  private
  
  def create_billing_account
    BillingAccount.create!(company: self)
  end
  
  def start_formation_workflow
    return if workflow_instances.exists?(workflow_type: 'company_formation')
    
    begin
      WorkflowService.start_formation_workflow(self)
    rescue => e
      Rails.logger.error "Failed to start workflow for company #{id}: #{e.message}"
      # Don't raise the error to prevent company creation from failing
    end
  end
end

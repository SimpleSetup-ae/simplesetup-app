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
  has_many :visa_applications, dependent: :destroy
  has_many :company_invitations, dependent: :destroy
  has_one :billing_account, dependent: :destroy
  
  # Specific person types
  has_many :shareholders, -> { where(type: 'shareholder') }, class_name: 'Person'
  has_many :directors, -> { where(type: 'director') }, class_name: 'Person'
  has_many :signatories, -> { where(type: 'signatory') }, class_name: 'Person'
  
  validates :name, presence: true
  validates :free_zone, presence: true
  validates :status, inclusion: { in: %w[draft in_progress pending_payment processing approved rejected issued] }
  validates :formation_step, inclusion: { in: %w[draft business_activities company_details people_ownership documents submitted] }, allow_nil: true
  
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
  scope :by_formation_step, ->(step) { where(formation_step: step) }
  scope :with_auto_save_data, -> { where.not(auto_save_data: {}) }
  
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

  # Form data management methods
  def form_data
    formation_data || {}
  end

  def auto_save_form_data
    auto_save_data || {}
  end

  def update_form_data(step_data, step_name = nil)
    current_data = form_data.deep_dup
    
    if step_name
      current_data[step_name] = step_data
    else
      current_data.merge!(step_data)
    end
    
    update!(
      formation_data: current_data,
      formation_step: determine_current_step(current_data)
    )
  end

  def auto_save_form_data!(step_data, step_name = nil)
    current_auto_save = auto_save_form_data.deep_dup
    
    if step_name
      current_auto_save[step_name] = step_data
    else
      current_auto_save.merge!(step_data)
    end
    
    update!(
      auto_save_data: current_auto_save,
      last_auto_save_at: Time.current
    )
  end

  def merge_auto_save_to_form_data!
    return if auto_save_data.blank?
    
    merged_data = form_data.deep_merge(auto_save_data)
    update!(
      formation_data: merged_data,
      formation_step: determine_current_step(merged_data),
      auto_save_data: {},
      last_auto_save_at: nil
    )
  end

  def form_completion_percentage
    return 0 if form_data.blank?
    
    required_fields = %w[business_activities company_names license_years visa_count]
    completed_fields = required_fields.count { |field| form_data[field].present? }
    
    (completed_fields.to_f / required_fields.length * 100).round
  end

  def has_unsaved_changes?
    auto_save_data.present? && last_auto_save_at.present?
  end

  def form_config_service
    @form_config_service ||= CompanyFormation::ConfigService.new(freezone_config || free_zone)
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

  def determine_current_step(data)
    return 'business_activities' if data['business_activities'].blank?
    return 'company_details' if data['company_names'].blank? || data['license_years'].blank?
    return 'people_ownership' if data['shareholders'].blank?
    return 'documents' if data['documents_uploaded'] != true
    'submitted'
  end
end

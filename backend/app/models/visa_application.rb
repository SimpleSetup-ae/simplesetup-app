class VisaApplication < ApplicationRecord
  belongs_to :company
  belongs_to :person
  has_many :documents, as: :documentable, dependent: :destroy
  
  validates :visa_type, presence: true, inclusion: { 
    in: %w[investor employee family visit partner] 
  }
  validates :status, inclusion: { 
    in: %w[entry_permit medical eid_biometrics stamping issuance completed cancelled rejected] 
  }
  validates :current_stage, presence: true, numericality: { 
    greater_than: 0, less_than_or_equal_to: :total_stages 
  }
  validates :visa_fee, numericality: { greater_than_or_equal_to: 0 }, allow_blank: true
  
  enum status: {
    entry_permit: 'entry_permit',
    medical: 'medical',
    eid_biometrics: 'eid_biometrics', 
    stamping: 'stamping',
    issuance: 'issuance',
    completed: 'completed',
    cancelled: 'cancelled',
    rejected: 'rejected'
  }
  
  enum visa_type: {
    investor: 'investor',
    employee: 'employee',
    family: 'family',
    visit: 'visit',
    partner: 'partner'
  }
  
  scope :active, -> { where.not(status: ['completed', 'cancelled', 'rejected']) }
  scope :completed, -> { where(status: 'completed') }
  scope :by_stage, ->(stage) { where(current_stage: stage) }
  
  def progress_percentage
    return 0 if total_stages.zero?
    ((current_stage.to_f / total_stages) * 100).round
  end
  
  def stage_name
    stage_names = {
      1 => 'Entry Permit',
      2 => 'Medical Examination',
      3 => 'EID Biometrics',
      4 => 'Passport Stamping',
      5 => 'Visa Issuance'
    }
    stage_names[current_stage] || "Stage #{current_stage}"
  end
  
  def next_stage_name
    stage_names = {
      1 => 'Medical Examination',
      2 => 'EID Biometrics', 
      3 => 'Passport Stamping',
      4 => 'Visa Issuance',
      5 => 'Completed'
    }
    stage_names[current_stage] || 'Unknown'
  end
  
  def can_advance_stage?
    current_stage < total_stages && !%w[completed cancelled rejected].include?(status)
  end
  
  def advance_to_next_stage!
    return false unless can_advance_stage?
    
    old_stage = current_stage
    new_stage = current_stage + 1
    
    # Update stage and status
    update!(
      current_stage: new_stage,
      status: get_status_for_stage(new_stage)
    )
    
    # Add to stage history
    add_stage_to_history(old_stage, new_stage)
    
    # Send notification
    VisaStageNotificationJob.perform_later(self, 'stage_advanced')
    
    true
  end
  
  def complete_application!(visa_number, expiry_date)
    update!(
      status: 'completed',
      visa_number: visa_number,
      visa_issuance_date: Date.current,
      visa_expiry_date: expiry_date,
      completed_at: Time.current,
      current_stage: total_stages
    )
    
    add_stage_to_history(current_stage, total_stages, 'Visa issued successfully')
    
    VisaStageNotificationJob.perform_later(self, 'completed')
  end
  
  def reject_application!(reason)
    update!(
      status: 'rejected',
      notes: [notes, "Rejected: #{reason}"].compact.join("\n")
    )
    
    add_stage_to_history(current_stage, current_stage, "Application rejected: #{reason}")
    
    VisaStageNotificationJob.perform_later(self, 'rejected')
  end
  
  def cancel_application!(reason = nil)
    update!(
      status: 'cancelled',
      notes: [notes, "Cancelled: #{reason}"].compact.join("\n")
    )
    
    add_stage_to_history(current_stage, current_stage, "Application cancelled: #{reason}")
  end
  
  def estimated_completion_date
    return nil unless submitted_at
    
    processing_days = case visa_type
                     when 'investor' then 21
                     when 'employee' then 14
                     when 'family' then 10
                     when 'visit' then 7
                     else 14
                     end
    
    submitted_at.to_date + processing_days.days
  end
  
  def days_until_completion
    return nil unless estimated_completion_date
    (estimated_completion_date - Date.current).to_i
  end
  
  def is_overdue?
    estimated_completion_date && estimated_completion_date < Date.current && !completed?
  end
  
  def get_required_documents_for_stage
    case current_stage
    when 1 # Entry Permit
      ['passport_copy', 'photo', 'emirates_id_copy', 'salary_certificate']
    when 2 # Medical
      ['medical_appointment_confirmation', 'medical_results']
    when 3 # EID Biometrics
      ['eid_appointment_confirmation', 'biometrics_completion']
    when 4 # Stamping
      ['passport_original', 'entry_permit_original']
    when 5 # Issuance
      ['visa_collection_receipt']
    else
      []
    end
  end
  
  private
  
  def get_status_for_stage(stage)
    status_mapping = {
      1 => 'entry_permit',
      2 => 'medical',
      3 => 'eid_biometrics',
      4 => 'stamping',
      5 => 'issuance'
    }
    status_mapping[stage] || status
  end
  
  def add_stage_to_history(from_stage, to_stage, note = nil)
    history_entry = {
      from_stage: from_stage,
      to_stage: to_stage,
      timestamp: Time.current.iso8601,
      note: note
    }
    
    update!(stage_history: stage_history + [history_entry])
  end
end

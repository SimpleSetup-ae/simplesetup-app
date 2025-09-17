class ApplicationProgress < ApplicationRecord
  self.table_name = 'application_progress'
  
  belongs_to :company
  
  validates :step, presence: true, numericality: { in: 0..7 }
  validates :percent, presence: true, numericality: { in: 0..100 }
  validates :company_id, uniqueness: true
  
  PAGES = %w[
    start
    license
    activities
    names
    shareholding
    members
    ubos
    review
  ].freeze
  
  validates :current_page, inclusion: { in: PAGES }, allow_nil: true
  
  before_validation :set_defaults, on: :create
  
  # Update progress tracking
  def update_progress(step_num, page_name = nil, additional_data = {})
    self.step = step_num
    self.percent = calculate_percentage(step_num)
    self.current_page = page_name if page_name
    self.last_activity_at = Time.current
    
    if additional_data.present?
      self.page_data ||= {}
      self.page_data.merge!(additional_data)
    end
    
    save!
  end
  
  # Calculate completion percentage based on step
  def calculate_percentage(step_num)
    return 0 if step_num <= 0
    return 100 if step_num >= 7
    
    # Each step represents approximately 14.3% progress
    ((step_num.to_f / 7) * 100).round
  end
  
  # Check if a specific page has been completed
  def page_completed?(page_name)
    page_index = PAGES.index(page_name)
    return false unless page_index
    
    step > page_index
  end
  
  # Get next incomplete page
  def next_page
    return 'start' if step == 0
    return 'review' if step >= 7
    
    # Skip UBO page if no corporate shareholders
    if step == 5 && PAGES[step] == 'ubos' # members -> ubos transition
      company_data = company&.application_data || {}
      shareholders = company_data['shareholders'] || []
      has_corporate_shareholders = shareholders.any? { |s| s['type'] == 'Corporate' }
      
      unless has_corporate_shareholders
        # Skip UBO step, go directly to review
        return 'review'
      end
    end
    
    PAGES[step] || 'start'
  end
  
  # Check if application can be submitted
  def ready_for_submission?
    step >= 7 && percent >= 100
  end
  
  private
  
  def set_defaults
    self.step ||= 0
    self.percent ||= 0
    self.last_activity_at ||= Time.current
    self.page_data ||= {}
  end
end

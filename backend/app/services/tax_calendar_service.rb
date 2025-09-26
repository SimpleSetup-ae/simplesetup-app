# frozen_string_literal: true

class TaxCalendarService
  include ActiveSupport::Configurable

  # UAE Tax Calendar Rules Configuration
  UAE_TIMEZONE = 'Asia/Dubai'.freeze
  WEEKEND_DAYS = [6, 7].freeze # Saturday=6, Sunday=7
  
  # UAE Public Holidays (2025) - Update annually
  UAE_HOLIDAYS_2025 = [
    Date.new(2025, 1, 1),   # New Year's Day
    Date.new(2025, 6, 28),  # Arafat Day (estimated)
    Date.new(2025, 6, 29),  # Eid Al Adha Day 1 (estimated)
    Date.new(2025, 6, 30),  # Eid Al Adha Day 2 (estimated)
    Date.new(2025, 7, 17),  # Islamic New Year (estimated)
    Date.new(2025, 9, 26),  # Prophet Muhammad's Birthday (estimated)
    Date.new(2025, 12, 2),  # UAE National Day
    Date.new(2025, 12, 3)   # Commemoration Day
  ].freeze

  def initialize(company)
    @company = company
    @current_date = Date.current
    @timezone = ActiveSupport::TimeZone[UAE_TIMEZONE]
  end

  def generate_tax_calendar(months_ahead: 12)
    calendar_events = []
    
    # Get company tax registrations
    tax_registrations = @company.tax_registrations.active_registrations
    
    # Generate Corporate Tax deadlines
    calendar_events.concat(generate_corporate_tax_deadlines(months_ahead))
    
    # Generate VAT deadlines if registered
    vat_registration = tax_registrations.find_by(registration_type: 'vat')
    if vat_registration
      calendar_events.concat(generate_vat_deadlines(vat_registration, months_ahead))
    end
    
    # Generate Excise Tax deadlines if registered
    excise_registration = tax_registrations.find_by(registration_type: 'excise')
    if excise_registration
      calendar_events.concat(generate_excise_deadlines(excise_registration, months_ahead))
    end
    # Sort by due date
    calendar_events.sort_by { |event| event[:due_date] }
  end

  private

  def generate_corporate_tax_deadlines(months_ahead)
    events = []
    
    # Corporate Tax Registration Deadline
    if should_generate_ct_registration_deadline?
      registration_due = calculate_ct_registration_due_date
      if registration_due && registration_due <= @current_date + months_ahead.months
        events << {
          type: 'corporate_tax_registration',
          title: 'Corporate Tax Registration Due',
          description: 'Register for Corporate Tax (mandatory for all UAE companies)',
          due_date: registration_due,
          urgency: calculate_urgency(registration_due),
          tax_type: 'corporate_tax',
          company_id: @company.id,
          notes: 'AED 10,000 penalty for late registration'
        }
      end
    end
    
    # Corporate Tax Return Deadlines
    ct_return_due = calculate_ct_return_due_date
    if ct_return_due && ct_return_due <= @current_date + months_ahead.months
      events << {
        type: 'corporate_tax_return',
        title: 'Corporate Tax Return Due',
        description: "File Corporate Tax return for FY ending #{@company.financial_year_end || 'Dec 31'}",
        due_date: ct_return_due,
        urgency: calculate_urgency(ct_return_due),
        tax_type: 'corporate_tax',
        company_id: @company.id,
        notes: '9-month deadline from financial year end'
      }
    end
    
    events
  end

  def generate_vat_deadlines(vat_registration, months_ahead)
    events = []
    return events unless vat_registration.active?
    
    # Determine VAT filing frequency (monthly or quarterly)
    frequency = vat_registration.tax_period || 'quarterly'
    
    case frequency
    when 'monthly'
      events.concat(generate_monthly_vat_deadlines(months_ahead))
    when 'quarterly'
      events.concat(generate_quarterly_vat_deadlines(months_ahead))
    end
    
    events
  end

  def generate_monthly_vat_deadlines(months_ahead)
    events = []
    
    (0..months_ahead).each do |month_offset|
      period_end = @current_date.beginning_of_month + month_offset.months + 1.month - 1.day
      due_date = adjust_to_working_day(period_end + 28.days, adjust_vat: true)
      
      next if due_date <= @current_date
      
      events << {
        type: 'vat_return',
        title: 'VAT Return Due (Monthly)',
        description: "VAT return for period ending #{period_end.strftime('%b %Y')}",
        due_date: due_date,
        urgency: calculate_urgency(due_date),
        tax_type: 'vat',
        company_id: @company.id,
        notes: '28 days from period end, adjusted for weekends/holidays'
      }
    end
    
    events
  end

  def generate_quarterly_vat_deadlines(months_ahead)
    events = []
    
    # Determine quarterly cycle (assume Jan/Apr/Jul/Oct for now)
    quarters = [
      { end_month: 3, name: 'Q1' },   # Jan-Mar
      { end_month: 6, name: 'Q2' },   # Apr-Jun
      { end_month: 9, name: 'Q3' },   # Jul-Sep
      { end_month: 12, name: 'Q4' }   # Oct-Dec
    ]
    
    current_year = @current_date.year
    (0..2).each do |year_offset|
      year = current_year + year_offset
      
      quarters.each do |quarter|
        period_end = Date.new(year, quarter[:end_month], -1) # Last day of month
        due_date = adjust_to_working_day(period_end + 28.days, adjust_vat: true)
        
        next if due_date <= @current_date
        next if due_date > @current_date + months_ahead.months
        
        events << {
          type: 'vat_return',
          title: 'VAT Return Due (Quarterly)',
          description: "VAT return for #{quarter[:name]} #{year}",
          due_date: due_date,
          urgency: calculate_urgency(due_date),
          tax_type: 'vat',
          company_id: @company.id,
          notes: '28 days from quarter end, adjusted for weekends/holidays'
        }
      end
    end
    
    events
  end

  def generate_excise_deadlines(excise_registration, months_ahead)
    events = []
    return events unless excise_registration.active?
    
    # Excise tax is monthly, due on 15th of following month
    (0..months_ahead).each do |month_offset|
      period_end = @current_date.beginning_of_month + month_offset.months + 1.month - 1.day
      due_date = adjust_to_working_day(Date.new(period_end.year, period_end.month, 15) + 1.month, adjust_excise: true)
      
      next if due_date <= @current_date
      
      events << {
        type: 'excise_return',
        title: 'Excise Tax Return Due',
        description: "Excise tax return for #{period_end.strftime('%b %Y')}",
        due_date: due_date,
        urgency: calculate_urgency(due_date),
        tax_type: 'excise',
        company_id: @company.id,
        notes: 'Due on 15th of following month, adjusted for weekends'
      }
    end
    
    events
  end

  def should_generate_ct_registration_deadline?
    # Check if company needs to register for Corporate Tax
    ct_registration = @company.tax_registrations.find_by(registration_type: 'corporate_tax')
    return false if ct_registration&.active?
    
    # All UAE companies incorporated after March 1, 2024 need CT registration
    incorporation_date = @company.incorporation_date || @company.licence_issue_date
    return false unless incorporation_date
    
    incorporation_date >= Date.new(2024, 3, 1)
  end

  def calculate_ct_registration_due_date
    trigger_date = @company.incorporation_date || @company.licence_issue_date
    return nil unless trigger_date
    
    if trigger_date >= Date.new(2024, 3, 1)
      # 3 months from incorporation/license issue
      trigger_date + 3.months
    else
      # Legacy rules for pre-March 2024 companies
      Date.new(2024, 6, 1) # Assuming they had until June 1, 2024
    end
  end

  def calculate_ct_return_due_date
    # Assume financial year end is December 31 unless specified
    fy_end = @company.financial_year_end || Date.new(@current_date.year - 1, 12, 31)
    
    # Corporate Tax return due 9 months after financial year end
    # Don't adjust for weekends per UAE rules (exact 9-month rule)
    fy_end + 9.months
  end

  def adjust_to_working_day(date, adjust_vat: false, adjust_excise: false, adjust_ct: false)
    return date if adjust_ct # CT deadlines are not adjusted
    
    # Only adjust VAT and Excise if specified in rules
    return date unless adjust_vat || adjust_excise
    
    adjusted_date = date
    
    # Move to next working day if falls on weekend or public holiday
    while weekend_day?(adjusted_date) || public_holiday?(adjusted_date)
      adjusted_date += 1.day
    end
    
    adjusted_date
  end

  def weekend_day?(date)
    # In UAE: Saturday = 6, Sunday = 7 (Ruby's wday: Sunday = 0, Saturday = 6)
    ruby_wday = date.wday
    uae_weekend = ruby_wday == 0 || ruby_wday == 6 # Sunday or Saturday
    uae_weekend
  end

  def public_holiday?(date)
    UAE_HOLIDAYS_2025.include?(date) # Extend for multiple years as needed
  end

  def calculate_urgency(due_date)
    days_until = (due_date - @current_date).to_i
    
    case days_until
    when 0..7
      'critical'
    when 8..30
      'high'
    when 31..90
      'medium'
    else
      'low'
    end
  end
end

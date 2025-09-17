class AddApplicationFieldsToCompanies < ActiveRecord::Migration[7.1]
  def change
    # License and visa fields
    add_column :companies, :trade_license_validity, :integer, default: 2
    add_column :companies, :visa_package, :integer, default: 0
    add_column :companies, :partner_visa_count, :integer, default: 0
    add_column :companies, :inside_country_visas, :integer, default: 0
    add_column :companies, :outside_country_visas, :integer, default: 0
    add_column :companies, :establishment_card, :boolean, default: false
    add_column :companies, :require_investor_or_partner_visa, :string
    
    # Shareholding fields
    add_column :companies, :share_capital, :decimal, precision: 15, scale: 2, default: 150000
    add_column :companies, :share_value, :decimal, precision: 10, scale: 2, default: 10
    add_column :companies, :total_shares, :integer
    add_column :companies, :voting_rights_proportional, :boolean, default: true
    add_column :companies, :voting_rights_notes, :text
    add_column :companies, :shareholding_type, :string
    
    # Business activity fields
    add_column :companies, :main_activity_id, :uuid
    add_column :companies, :request_custom_activity, :boolean, default: false
    add_column :companies, :custom_activity_description, :text
    add_column :companies, :countries_of_operation, :string, array: true, default: ['UAE']
    add_column :companies, :operate_as_franchise, :boolean, default: false
    add_column :companies, :franchise_details, :text
    
    # Company name fields
    add_column :companies, :name_options, :string, array: true, default: []
    add_column :companies, :name_arabic, :string
    
    # Admin fields for after formation
    add_column :companies, :license_type, :string
    add_column :companies, :license_status, :string
    add_column :companies, :business_community, :string
    add_column :companies, :first_license_issue_date, :date
    add_column :companies, :current_license_issue_date, :date
    add_column :companies, :license_expiry_date, :date
    add_column :companies, :establishment_card_number, :string
    add_column :companies, :establishment_card_issue_date, :date
    add_column :companies, :establishment_card_expiry_date, :date
    
    # Other fields
    add_column :companies, :gm_signatory_name, :string
    add_column :companies, :gm_signatory_email, :string
    add_column :companies, :ubo_terms_accepted, :boolean, default: false
    add_column :companies, :accept_activity_rules, :boolean, default: false
  end
end

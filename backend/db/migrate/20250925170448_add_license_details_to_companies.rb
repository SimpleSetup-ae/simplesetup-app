class AddLicenseDetailsToCompanies < ActiveRecord::Migration[7.1]
  def change
    # License Details
    add_column :companies, :trade_license_number, :string
    add_column :companies, :licensee, :string
    add_column :companies, :operating_name, :string
    add_column :companies, :legal_status, :string
    add_column :companies, :first_issue_date, :date
    add_column :companies, :current_issue_date, :date
    add_column :companies, :business_unit_section, :string

    # General Manager
    add_column :companies, :general_manager_name, :string

    # Address Details
    add_column :companies, :premises_no, :string
    add_column :companies, :floor, :string
    add_column :companies, :building, :string
    add_column :companies, :business_unit_address_block, :string
    add_column :companies, :area, :string

    # Activities - stored as array of strings
    add_column :companies, :business_activities, :string, array: true, default: []

    # Reference and Contact Information
    add_column :companies, :reference_code, :string
    add_column :companies, :contact_phone, :string
    add_column :companies, :contact_website, :string

    # Add indexes for performance
    add_index :companies, :trade_license_number
    add_index :companies, :reference_code
    add_index :companies, :business_activities, using: :gin
  end
end
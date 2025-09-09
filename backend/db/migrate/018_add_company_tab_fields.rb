class AddCompanyTabFields < ActiveRecord::Migration[7.1]
  def change
    add_column :companies, :website, :string
    add_column :companies, :official_email, :string
    add_column :companies, :phone, :string
    add_column :companies, :operating_name_arabic, :string
    add_column :companies, :license_type, :string, default: 'IFZA Freezone License'
    add_column :companies, :first_license_issue_date, :date
    add_column :companies, :current_license_issue_date, :date
    add_column :companies, :license_expiry_date, :date
    add_column :companies, :establishment_card_number, :string
    add_column :companies, :establishment_card_issue_date, :date
    add_column :companies, :establishment_card_expiry_date, :date
    
    # Add indexes for performance
    add_index :companies, :official_email
    add_index :companies, :phone
    add_index :companies, :license_expiry_date
    add_index :companies, :establishment_card_expiry_date
  end
end

class AddPassportExpiryToPeople < ActiveRecord::Migration[7.1]
  def change
    add_column :people, :passport_expiry_date, :date
    add_column :people, :passport_issue_date, :date
    
    # Add indexes for performance
    add_index :people, :passport_expiry_date
    add_index :people, :passport_issue_date
  end
end

class AddFormDataToCompanies < ActiveRecord::Migration[7.0]
  def change
    # Add JSON fields to existing Company model for form data
    add_column :companies, :formation_data, :jsonb, default: {}
    add_column :companies, :formation_step, :string, default: 'draft'
    add_column :companies, :auto_save_data, :jsonb, default: {}
    add_column :companies, :freezone_config, :string, default: 'IFZA'
    
    # Add indexes for performance
    add_index :companies, :formation_step
    add_index :companies, :formation_data, using: :gin
    add_index :companies, :auto_save_data, using: :gin
    add_index :companies, :freezone_config
    
    # Add timestamps for auto-save tracking
    add_column :companies, :last_auto_save_at, :datetime
  end
end

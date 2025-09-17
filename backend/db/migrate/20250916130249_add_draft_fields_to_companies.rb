class AddDraftFieldsToCompanies < ActiveRecord::Migration[7.1]
  def change
    add_column :companies, :draft_token, :string
    add_column :companies, :formation_type, :string
    add_column :companies, :estimated_annual_turnover, :decimal, precision: 15, scale: 2
    add_column :companies, :formation_step, :string
    add_column :companies, :completion_percentage, :integer, default: 0
    add_column :companies, :auto_save_data, :jsonb, default: {}
    add_column :companies, :submitted_at, :datetime
    add_column :companies, :approved_at, :datetime
    add_column :companies, :rejected_at, :datetime
    add_column :companies, :formed_at, :datetime
    
    add_index :companies, :draft_token, unique: true
    add_index :companies, :formation_type
    add_index :companies, :formation_step
    add_index :companies, :submitted_at
  end
end

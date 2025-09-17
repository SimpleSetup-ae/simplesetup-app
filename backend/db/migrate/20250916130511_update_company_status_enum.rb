class UpdateCompanyStatusEnum < ActiveRecord::Migration[7.1]
  def change
    # Since status is a string column, we just need to update any validation in the model
    # No database changes needed - the status column already accepts any string value
    # The validation will be updated in the Company model
    
    # Add index for new statuses
    add_index :companies, [:status, :submitted_at], name: 'index_companies_on_status_and_submitted'
    add_index :companies, [:status, :owner_id], name: 'index_companies_on_status_and_owner'
  end
end
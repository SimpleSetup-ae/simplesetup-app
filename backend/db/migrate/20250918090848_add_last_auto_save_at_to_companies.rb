class AddLastAutoSaveAtToCompanies < ActiveRecord::Migration[7.1]
  def change
    add_column :companies, :last_auto_save_at, :datetime
  end
end

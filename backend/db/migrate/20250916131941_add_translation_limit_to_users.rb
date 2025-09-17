class AddTranslationLimitToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :translation_requests_count, :integer, default: 0, null: false
    add_column :users, :translation_requests_reset_at, :datetime
    
    add_index :users, :translation_requests_reset_at
  end
end

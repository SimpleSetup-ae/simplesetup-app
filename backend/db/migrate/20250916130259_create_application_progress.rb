class CreateApplicationProgress < ActiveRecord::Migration[7.1]
  def change
    create_table :application_progress, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid :company_id, null: false
      t.integer :step, null: false, default: 0
      t.integer :percent, null: false, default: 0
      t.datetime :last_activity_at, null: false, default: -> { 'now()' }
      t.string :current_page
      t.jsonb :page_data, default: {}

      t.timestamps
    end
    
    add_index :application_progress, :company_id, unique: true
    add_foreign_key :application_progress, :companies, on_delete: :cascade
  end
end

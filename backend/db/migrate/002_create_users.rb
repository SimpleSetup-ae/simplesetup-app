class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid do |t|
      # legacy: clerk_id removed by migration 022_remove_clerk_id_from_users
      t.string :email, null: false, index: { unique: true }
      t.string :first_name
      t.string :last_name
      t.jsonb :metadata, default: {}
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
  end
end

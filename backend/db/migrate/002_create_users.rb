class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid do |t|
      t.string :clerk_id, null: false, index: { unique: true }
      t.string :email, null: false, index: { unique: true }
      t.string :first_name
      t.string :last_name
      t.jsonb :metadata, default: {}
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
  end
end

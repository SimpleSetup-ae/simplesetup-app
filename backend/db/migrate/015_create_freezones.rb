class CreateFreezones < ActiveRecord::Migration[7.1]
  def change
    create_table :freezones, id: :uuid do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.string :location
      t.text :description
      t.boolean :active, default: true, null: false
      t.string :website_url
      t.string :contact_email
      t.string :contact_phone
      t.jsonb :metadata, default: {}
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :freezones, :name
    add_index :freezones, :code, unique: true
    add_index :freezones, :active
  end
end

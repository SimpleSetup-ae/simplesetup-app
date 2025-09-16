class CreateCompanies < ActiveRecord::Migration[7.1]
  def change
    create_table :companies, id: :uuid do |t|
      t.string :name, null: false
      t.string :trade_name
      t.string :license_number, index: { unique: true }
      t.string :free_zone, null: false
      t.string :status, null: false, default: 'draft'
      t.references :owner, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.text :activity_codes, array: true, default: []
      t.jsonb :metadata, default: {}
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    

  end
end

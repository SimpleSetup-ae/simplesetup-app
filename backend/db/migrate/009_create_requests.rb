class CreateRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :requests, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.references :requested_by, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.string :request_type, null: false
      t.string :status, null: false, default: 'pending'
      t.string :title, null: false
      t.text :description
      t.jsonb :request_data, default: {}
      t.jsonb :response_data, default: {}
      t.decimal :fee_amount, precision: 10, scale: 2
      t.string :fee_currency, default: 'AED'
      t.datetime :submitted_at
      t.datetime :processed_at
      t.datetime :completed_at
      t.text :notes
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :requests, :request_type
    add_index :requests, :status
    add_index :requests, :submitted_at
    add_index :requests, [:company_id, :status]
  end
end

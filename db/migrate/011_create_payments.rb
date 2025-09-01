class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.references :workflow_step, null: true, foreign_key: true, type: :uuid
      t.string :stripe_payment_intent_id
      t.string :payment_type, null: false # formation_fee, service_fee, tax_registration
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :currency, null: false, default: 'AED'
      t.string :status, null: false, default: 'pending'
      t.text :description
      t.jsonb :stripe_metadata, default: {}
      t.jsonb :payment_breakdown, default: {}
      t.datetime :paid_at
      t.datetime :failed_at
      t.text :failure_reason
      t.datetime :refunded_at
      t.decimal :refund_amount, precision: 10, scale: 2
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :payments, :stripe_payment_intent_id, unique: true
    add_index :payments, :payment_type
    add_index :payments, :status
    add_index :payments, :paid_at
    add_index :payments, [:company_id, :status]
  end
end

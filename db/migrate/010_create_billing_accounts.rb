class CreateBillingAccounts < ActiveRecord::Migration[7.1]
  def change
    create_table :billing_accounts, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.string :stripe_customer_id
      t.string :billing_email
      t.jsonb :billing_address, default: {}
      t.string :default_payment_method_id
      t.decimal :account_balance, precision: 10, scale: 2, default: 0.0
      t.string :currency, default: 'AED'
      t.jsonb :metadata, default: {}
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :billing_accounts, :stripe_customer_id, unique: true
    add_index :billing_accounts, :billing_email
  end
end

class AddClientDashboardFields < ActiveRecord::Migration[7.1]
  def change
    # Add license renewal tracking to companies
    add_column :companies, :license_issued_at, :datetime
    add_column :companies, :license_renewal_date, :datetime
    add_column :companies, :trade_license_url, :string
    add_column :companies, :moa_url, :string
    
    # Add passport expiry tracking to people
    add_column :people, :passport_expiry_date, :date
    add_column :people, :emirates_id_expiry_date, :date
    
    # Create notifications table
    create_table :notifications, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :company, null: true, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.text :message, null: false
      t.string :type, null: false # 'info', 'warning', 'error', 'success'
      t.string :action_url
      t.boolean :read, default: false
      t.datetime :read_at
      t.jsonb :metadata, default: {}
      t.datetime :expires_at
      
      t.timestamps
    end
    
    add_index :notifications, [:user_id, :read]
    add_index :notifications, [:company_id]
    add_index :notifications, [:type]
    add_index :notifications, [:created_at]
  end
end

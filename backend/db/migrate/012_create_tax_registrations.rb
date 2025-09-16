class CreateTaxRegistrations < ActiveRecord::Migration[7.1]
  def change
    create_table :tax_registrations, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.string :registration_type, null: false # corporate_tax, vat, excise
      t.string :status, null: false, default: 'not_registered'
      t.string :trn_number # Tax Registration Number
      t.date :registration_date
      t.date :effective_date
      t.date :next_filing_date
      t.decimal :annual_turnover, precision: 15, scale: 2
      t.string :tax_period # monthly, quarterly, annual
      t.jsonb :registration_details, default: {}
      t.jsonb :filing_history, default: []
      t.text :notes
      t.datetime :applied_at
      t.datetime :approved_at
      t.datetime :rejected_at
      t.text :rejection_reason
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :tax_registrations, :registration_type
    add_index :tax_registrations, :status
    add_index :tax_registrations, :trn_number, unique: true, where: "trn_number IS NOT NULL"
    add_index :tax_registrations, [:company_id, :registration_type], unique: true
    add_index :tax_registrations, :next_filing_date
  end
end

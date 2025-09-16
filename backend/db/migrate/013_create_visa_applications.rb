class CreateVisaApplications < ActiveRecord::Migration[7.1]
  def change
    create_table :visa_applications, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.references :person, null: false, foreign_key: true, type: :uuid
      t.string :visa_type, null: false # investor, employee, family, visit
      t.string :status, null: false, default: 'entry_permit'
      t.integer :current_stage, default: 1
      t.integer :total_stages, default: 5
      t.string :application_number
      t.string :entry_permit_number
      t.string :visa_number
      t.date :entry_permit_date
      t.date :medical_date
      t.date :eid_appointment_date
      t.date :stamping_date
      t.date :visa_issuance_date
      t.date :visa_expiry_date
      t.decimal :visa_fee, precision: 10, scale: 2
      t.string :fee_currency, default: 'AED'
      t.jsonb :application_data, default: {}
      t.jsonb :stage_history, default: []
      t.text :notes
      t.datetime :submitted_at
      t.datetime :completed_at
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :visa_applications, :visa_type
    add_index :visa_applications, :status
    add_index :visa_applications, :application_number, unique: true, where: "application_number IS NOT NULL"
    add_index :visa_applications, :visa_number, unique: true, where: "visa_number IS NOT NULL"
    add_index :visa_applications, [:company_id, :status]
    add_index :visa_applications, :submitted_at
  end
end

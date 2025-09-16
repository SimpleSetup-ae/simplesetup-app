class CreatePeople < ActiveRecord::Migration[7.1]
  def change
    create_table :people, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.string :type, null: false # shareholder, director, signatory
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :nationality
      t.string :passport_number
      t.string :emirates_id
      t.date :date_of_birth
      t.string :gender
      t.decimal :share_percentage, precision: 5, scale: 2
      t.string :appointment_type # for directors
      t.jsonb :contact_info, default: {}
      t.jsonb :metadata, default: {}
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :people, :type
    add_index :people, :passport_number
    add_index :people, :emirates_id
    add_index :people, [:company_id, :type]
  end
end

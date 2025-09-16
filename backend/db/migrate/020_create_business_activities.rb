class CreateBusinessActivities < ActiveRecord::Migration[7.1]
  def change
    create_table :business_activities, id: :uuid do |t|
      t.string :freezone, null: false
      t.string :activity_code, null: false
      t.string :activity_name, null: false
      t.text :activity_description
      t.string :activity_type, null: false # 'Professional' or 'Commercial'
      t.string :property_requirements
      t.text :notes
      t.string :classification
      t.string :regulation_type, null: false, default: 'Non-Regulated' # 'Regulated' or 'Non-Regulated'
      t.string :approving_entity_1
      t.string :approving_entity_2
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :business_activities, :freezone
    add_index :business_activities, :activity_code, unique: true
    add_index :business_activities, :activity_type
    add_index :business_activities, :regulation_type
    add_index :business_activities, [:freezone, :activity_type]
  end
end

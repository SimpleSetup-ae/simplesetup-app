class CreateWorkflowSteps < ActiveRecord::Migration[7.1]
  def change
    create_table :workflow_steps, id: :uuid do |t|
      t.references :workflow_instance, null: false, foreign_key: true, type: :uuid
      t.integer :step_number, null: false
      t.string :step_type, null: false
      t.string :title, null: false
      t.text :description
      t.string :status, null: false, default: 'pending'
      t.jsonb :data, default: {}
      t.jsonb :validation_rules, default: {}
      t.datetime :started_at
      t.datetime :completed_at
      t.text :error_message
      
      t.timestamps
    end
    
    add_index :workflow_steps, :step_type
    add_index :workflow_steps, :status
    add_index :workflow_steps, [:workflow_instance_id, :step_number], unique: true
  end
end

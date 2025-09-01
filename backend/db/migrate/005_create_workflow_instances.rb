class CreateWorkflowInstances < ActiveRecord::Migration[7.1]
  def change
    create_table :workflow_instances, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.string :workflow_type, null: false
      t.string :status, null: false, default: 'pending'
      t.integer :current_step, default: 0
      t.jsonb :metadata, default: {}
      t.jsonb :form_data, default: {}
      t.datetime :started_at
      t.datetime :completed_at
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :workflow_instances, :workflow_type
    add_index :workflow_instances, :status
    add_index :workflow_instances, [:company_id, :workflow_type]
  end
end

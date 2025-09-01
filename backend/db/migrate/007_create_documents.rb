class CreateDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :documents, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.references :workflow_step, null: true, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.string :document_type
      t.string :file_name, null: false
      t.bigint :file_size, null: false
      t.string :mime_type, null: false
      t.string :storage_path, null: false
      t.string :storage_bucket, default: 'documents'
      t.string :ocr_status, default: 'pending'
      t.jsonb :ocr_data, default: {}
      t.decimal :confidence_score, precision: 5, scale: 4
      t.text :extracted_text
      t.jsonb :metadata, default: {}
      t.datetime :uploaded_at
      t.datetime :processed_at
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :documents, :document_type
    add_index :documents, :ocr_status
    add_index :documents, :uploaded_at
    add_index :documents, :storage_path, unique: true
  end
end

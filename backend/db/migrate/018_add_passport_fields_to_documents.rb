class AddPassportFieldsToDocuments < ActiveRecord::Migration[7.0]
  def change
    # Add document type if not exists
    add_column :documents, :document_type, :string unless column_exists?(:documents, :document_type)
    add_index :documents, :document_type unless index_exists?(:documents, :document_type)
    
    # Add user association
    add_reference :documents, :user, type: :uuid, foreign_key: true, null: true unless column_exists?(:documents, :user_id)
    
    # Add person association for linking to shareholders/directors
    add_reference :documents, :person, type: :uuid, foreign_key: true, null: true unless column_exists?(:documents, :person_id)
    
    # Rename mime_type to content_type if needed
    if column_exists?(:documents, :mime_type) && !column_exists?(:documents, :content_type)
      rename_column :documents, :mime_type, :content_type
    elsif !column_exists?(:documents, :content_type)
      add_column :documents, :content_type, :string
    end
    
    # Add extracted data fields
    add_column :documents, :extracted_data, :jsonb, default: {} unless column_exists?(:documents, :extracted_data)
    add_column :documents, :fraud_assessment, :jsonb, default: {} unless column_exists?(:documents, :fraud_assessment)
    add_column :documents, :file_data, :text unless column_exists?(:documents, :file_data)
    add_column :documents, :thumbnail_data, :text unless column_exists?(:documents, :thumbnail_data)
    
    # Add verification fields
    add_column :documents, :verified, :boolean, default: false unless column_exists?(:documents, :verified)
    add_column :documents, :verified_at, :datetime unless column_exists?(:documents, :verified_at)
    add_column :documents, :verified_by_id, :uuid unless column_exists?(:documents, :verified_by_id)
    
    # Add OCR timestamps
    add_column :documents, :ocr_completed_at, :datetime unless column_exists?(:documents, :ocr_completed_at)
    add_column :documents, :fraud_check_completed_at, :datetime unless column_exists?(:documents, :fraud_check_completed_at)
    
    # Add confidence score if not exists
    add_column :documents, :confidence_score, :float unless column_exists?(:documents, :confidence_score)
    add_column :documents, :extracted_text, :text unless column_exists?(:documents, :extracted_text)
    
    # Add indexes for JSON fields
    add_index :documents, :extracted_data, using: :gin unless index_exists?(:documents, :extracted_data)
    add_index :documents, :fraud_assessment, using: :gin unless index_exists?(:documents, :fraud_assessment)
    add_index :documents, :verified unless index_exists?(:documents, :verified)
    
    # Add index for high-risk documents
    execute <<-SQL unless index_exists?(:documents, :fraud_risk_band)
      CREATE INDEX index_documents_on_fraud_risk_band 
      ON documents ((fraud_assessment->>'risk_band'))
      WHERE fraud_assessment IS NOT NULL;
    SQL
  end
end



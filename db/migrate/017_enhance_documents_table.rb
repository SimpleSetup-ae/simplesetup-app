class EnhanceDocumentsTable < ActiveRecord::Migration[7.0]
  def change
    # Add columns for Supabase storage integration
    add_column :documents, :storage_provider, :string, default: 'supabase'
    add_column :documents, :bucket_name, :string
    add_column :documents, :file_path, :string
    add_column :documents, :public_url, :text
    add_column :documents, :signed_url, :text
    add_column :documents, :signed_url_expires_at, :datetime
    add_column :documents, :content_type, :string
    add_column :documents, :file_size, :bigint
    add_column :documents, :original_filename, :string
    add_column :documents, :document_category, :string
    add_column :documents, :person_id, :string # For linking to specific people (shareholders, directors)
    add_column :documents, :upload_status, :string, default: 'pending'
    add_column :documents, :upload_error, :text
    add_column :documents, :metadata, :jsonb, default: {}
    
    # Add indexes for performance
    add_index :documents, :storage_provider
    add_index :documents, :file_path
    add_index :documents, :document_category
    add_index :documents, :person_id
    add_index :documents, :upload_status
    add_index :documents, :metadata, using: :gin
    
    # Add foreign key constraint to companies if not exists
    unless foreign_key_exists?(:documents, :companies)
      add_foreign_key :documents, :companies, on_delete: :cascade
    end
  end
  
  def down
    remove_column :documents, :storage_provider
    remove_column :documents, :bucket_name
    remove_column :documents, :file_path
    remove_column :documents, :public_url
    remove_column :documents, :signed_url
    remove_column :documents, :signed_url_expires_at
    remove_column :documents, :content_type
    remove_column :documents, :file_size
    remove_column :documents, :original_filename
    remove_column :documents, :document_category
    remove_column :documents, :person_id
    remove_column :documents, :upload_status
    remove_column :documents, :upload_error
    remove_column :documents, :metadata
  end
end

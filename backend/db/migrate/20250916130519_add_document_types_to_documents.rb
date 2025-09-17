class AddDocumentTypesToDocuments < ActiveRecord::Migration[7.1]
  def change
    # Add document category for better organization
    add_column :documents, :document_category, :string
    add_column :documents, :document_sub_type, :string
    add_column :documents, :is_ubo_document, :boolean, default: false
    add_column :documents, :parent_company_id, :uuid
    add_column :documents, :expiry_date, :date
    add_column :documents, :issue_date, :date
    add_column :documents, :issuing_country, :string
    add_column :documents, :issuing_authority, :string
    
    add_index :documents, :document_category
    add_index :documents, :document_sub_type
    add_index :documents, :is_ubo_document
    add_index :documents, :parent_company_id
    add_index :documents, :expiry_date
    
    # Document categories for our form:
    # 'identity' - passports, national_id, emirates_id
    # 'visa' - uae_visa
    # 'address' - proof_of_address  
    # 'corporate' - coi, moa, board_resolution, good_standing
    # 'ubo' - ubo_declaration, ubo_passports
    # 'financial' - bank_letter
    # 'license' - trade_license, establishment_card
    # 'other' - any other supporting documents
  end
end
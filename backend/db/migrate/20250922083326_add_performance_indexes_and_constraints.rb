class AddPerformanceIndexesAndConstraints < ActiveRecord::Migration[7.1]
  def change
    # Add compound indexes for common query patterns
    add_index :companies, [:status, :submitted_at], name: 'index_companies_on_status_submitted'
    add_index :companies, [:status, :owner_id], name: 'index_companies_on_status_owner'
    add_index :documents, [:company_id, :document_type], name: 'index_documents_on_company_type'
    add_index :documents, [:company_id, :document_type, :verified], name: 'index_documents_on_company_type_verified'
    add_index :documents, [:user_id, :document_type], name: 'index_documents_on_user_type'
    add_index :payments, [:company_id, :status], name: 'index_payments_on_company_status'
    add_index :payments, [:company_id, :status, :paid_at], name: 'index_payments_on_company_status_paid'
    add_index :visa_applications, [:company_id, :person_id, :status], name: 'index_visa_applications_on_company_person_status'
    add_index :tax_registrations, [:company_id, :status], name: 'index_tax_registrations_on_company_status'

    # Add GIN indexes for JSONB fields that are frequently queried
    add_index :companies, :metadata, using: :gin, name: 'index_companies_metadata'
    add_index :documents, :extracted_data, using: :gin, name: 'index_documents_extracted_data'
    add_index :documents, :fraud_assessment, using: :gin, name: 'index_documents_fraud_assessment'
    add_index :people, :contact_info, using: :gin, name: 'index_people_contact_info'

    # Add indexes for array fields
    add_index :companies, :activity_codes, using: :gin, name: 'index_companies_activity_codes'
    add_index :companies, :countries_of_operation, using: :gin, name: 'index_companies_countries_of_operation'
    add_index :companies, :name_options, using: :gin, name: 'index_companies_name_options'

    # Add indexes for frequently filtered fields
    add_index :companies, :formation_type, name: 'index_companies_formation_type'
    add_index :companies, :formation_step, name: 'index_companies_formation_step'
    add_index :documents, :ocr_status, name: 'index_documents_ocr_status'
    add_index :documents, :verified, name: 'index_documents_verified'
    add_index :documents, :document_category, name: 'index_documents_document_category'
    add_index :workflow_instances, :workflow_type, name: 'index_workflow_instances_workflow_type'
    add_index :workflow_steps, :step_type, name: 'index_workflow_steps_step_type'

    # Add foreign key constraints with proper cascade behavior for soft deletes
    # Note: Skip foreign keys that already exist to avoid migration conflicts
    # These can be added later in a separate migration if needed

    # Add critical foreign keys that may be missing (check with database admin)
    # Most foreign keys were already created by previous migrations
    # We'll focus on the indexes which are more critical for performance

    # Add check constraints for data integrity (only for tables with consistent status values)
    # Note: Skip companies check constraint as existing data may have additional status values
    add_check_constraint :payments, "status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled')", name: 'payments_status_check'
    add_check_constraint :visa_applications, "status IN ('entry_permit', 'medical', 'eid_appointment', 'stamping', 'completed', 'rejected')", name: 'visa_applications_status_check'
    add_check_constraint :documents, "ocr_status IN ('pending', 'processing', 'completed', 'failed')", name: 'documents_ocr_status_check'
    add_check_constraint :workflow_instances, "status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')", name: 'workflow_instances_status_check'
    add_check_constraint :workflow_steps, "status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')", name: 'workflow_steps_status_check'
    add_check_constraint :requests, "status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled')", name: 'requests_status_check'

    # Add NOT NULL constraints for critical fields
    change_column_null :companies, :name, false
    change_column_null :companies, :free_zone, false
    change_column_null :companies, :status, false
    change_column_null :documents, :name, false
    change_column_null :documents, :file_name, false
    change_column_null :documents, :content_type, false
    change_column_null :documents, :storage_path, false
    change_column_null :people, :type, false
    change_column_null :people, :first_name, false
    change_column_null :people, :last_name, false
    change_column_null :users, :email, false
    change_column_null :workflow_steps, :step_number, false
    change_column_null :workflow_steps, :step_type, false
    change_column_null :workflow_steps, :title, false
  end
end

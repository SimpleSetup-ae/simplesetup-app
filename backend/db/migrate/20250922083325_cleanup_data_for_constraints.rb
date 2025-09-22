class CleanupDataForConstraints < ActiveRecord::Migration[7.1]
  def up
    puts "🧹 Cleaning up data to ensure compliance with new constraints..."
    
    # 1. Fix NULL values in companies table
    Company.where(name: nil).update_all(name: 'Unnamed Company')
    Company.where(free_zone: nil).update_all(free_zone: 'IFZA')
    Company.where(status: nil).update_all(status: 'draft')
    
    # Ensure company status values are valid (not in check constraint but good to ensure)
    invalid_statuses = Company.where.not(status: ['draft', 'submitted', 'reviewing', 'approved', 'issued', 'rejected', 'cancelled'])
    if invalid_statuses.any?
      puts "  ⚠️  Found #{invalid_statuses.count} companies with invalid status values"
      invalid_statuses.update_all(status: 'draft')
    end
    
    # 2. Fix NULL values in documents table
    Document.where(name: nil).update_all(name: 'Untitled Document')
    Document.where(file_name: nil).update_all(file_name: 'unknown_file')
    Document.where(content_type: nil).update_all(content_type: 'application/octet-stream')
    Document.where(storage_path: nil).update_all(storage_path: 'documents/unknown')
    
    # Fix OCR status values to match the check constraint
    Document.where(ocr_status: nil).update_all(ocr_status: 'pending')
    invalid_ocr_statuses = Document.where.not(ocr_status: ['pending', 'processing', 'completed', 'failed'])
    if invalid_ocr_statuses.any?
      puts "  ⚠️  Found #{invalid_ocr_statuses.count} documents with invalid ocr_status values"
      invalid_ocr_statuses.update_all(ocr_status: 'pending')
    end
    
    # 3. Fix NULL values in people table
    Person.where(type: nil).update_all(type: 'Person')
    Person.where(first_name: nil).update_all(first_name: 'Unknown')
    Person.where(last_name: nil).update_all(last_name: 'Person')
    
    # 4. Fix NULL values in users table
    User.where(email: nil).each_with_index do |user, index|
      user.update_columns(email: "user_#{user.id || index}@placeholder.com")
    end
    
    # 5. Fix NULL values in workflow_steps table
    WorkflowStep.where(step_number: nil).update_all(step_number: 0)
    WorkflowStep.where(step_type: nil).update_all(step_type: 'manual')
    WorkflowStep.where(title: nil).update_all(title: 'Untitled Step')
    
    # Fix workflow step status values
    WorkflowStep.where(status: nil).update_all(status: 'pending')
    invalid_wf_statuses = WorkflowStep.where.not(status: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'])
    if invalid_wf_statuses.any?
      puts "  ⚠️  Found #{invalid_wf_statuses.count} workflow steps with invalid status values"
      invalid_wf_statuses.update_all(status: 'pending')
    end
    
    # 6. Fix workflow_instances status values
    WorkflowInstance.where(status: nil).update_all(status: 'pending')
    invalid_wi_statuses = WorkflowInstance.where.not(status: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'])
    if invalid_wi_statuses.any?
      puts "  ⚠️  Found #{invalid_wi_statuses.count} workflow instances with invalid status values"
      invalid_wi_statuses.update_all(status: 'pending')
    end
    
    # 7. Fix payments status values
    Payment.where(status: nil).update_all(status: 'pending')
    invalid_payment_statuses = Payment.where.not(status: ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'])
    if invalid_payment_statuses.any?
      puts "  ⚠️  Found #{invalid_payment_statuses.count} payments with invalid status values"
      invalid_payment_statuses.update_all(status: 'pending')
    end
    
    # 8. Fix visa_applications status values
    VisaApplication.where(status: nil).update_all(status: 'entry_permit')
    invalid_visa_statuses = VisaApplication.where.not(status: ['entry_permit', 'medical', 'eid_appointment', 'stamping', 'completed', 'rejected'])
    if invalid_visa_statuses.any?
      puts "  ⚠️  Found #{invalid_visa_statuses.count} visa applications with invalid status values"
      invalid_visa_statuses.update_all(status: 'entry_permit')
    end
    
    # 9. Fix requests status values
    Request.where(status: nil).update_all(status: 'pending')
    invalid_request_statuses = Request.where.not(status: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'])
    if invalid_request_statuses.any?
      puts "  ⚠️  Found #{invalid_request_statuses.count} requests with invalid status values"
      invalid_request_statuses.update_all(status: 'pending')
    end
    
    puts "✅ Data cleanup completed successfully!"
  end
  
  def down
    # This migration is not reversible as it modifies data
    puts "⚠️  This migration cannot be reversed as it modifies existing data"
  end
end
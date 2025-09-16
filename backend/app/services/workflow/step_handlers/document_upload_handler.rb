module Workflow
  module StepHandlers
    class DocumentUploadHandler
      attr_reader :workflow_step, :step_config
      
      def initialize(workflow_step)
        @workflow_step = workflow_step
        @step_config = workflow_step.data
      end
      
      def render_upload_interface
        {
          step_number: workflow_step.step_number,
          title: workflow_step.title,
          description: workflow_step.description,
          document_requirements: process_document_requirements,
          uploaded_documents: get_uploaded_documents,
          upload_url: generate_upload_url
        }
      end
      
      def process_document_upload(document_data)
        # Validate document against requirements
        validation_result = validate_document(document_data)
        
        unless validation_result[:valid]
          return {
            success: false,
            errors: validation_result[:errors]
          }
        end
        
        # Create document record
        document = create_document_record(document_data)
        
        if document.persisted?
          # Trigger OCR processing if needed
          if should_process_ocr?(document)
            document.start_processing!
          end
          
          {
            success: true,
            document: document,
            message: 'Document uploaded successfully'
          }
        else
          {
            success: false,
            errors: document.errors.full_messages
          }
        end
      end
      
      def check_completion_status
        requirements = step_config['document_requirements'] || []
        uploaded_docs = get_uploaded_documents
        
        required_types = requirements.select { |req| req['required'] }.map { |req| req['type'] }
        uploaded_types = uploaded_docs.map { |doc| doc.document_type }
        
        missing_types = required_types - uploaded_types
        
        {
          complete: missing_types.empty?,
          missing_documents: missing_types,
          uploaded_count: uploaded_docs.count,
          required_count: required_types.count
        }
      end
      
      def process_completion
        completion_status = check_completion_status
        
        unless completion_status[:complete]
          return {
            success: false,
            errors: ["Missing required documents: #{completion_status[:missing_documents].join(', ')}"]
          }
        end
        
        # All documents uploaded, mark step as ready for completion
        {
          success: true,
          data: {
            documents_uploaded: completion_status[:uploaded_count],
            completion_timestamp: Time.current.iso8601
          }
        }
      end
      
      private
      
      def process_document_requirements
        requirements = step_config['document_requirements'] || []
        
        requirements.map do |req|
          processed_req = req.dup
          processed_req['uploaded'] = document_uploaded?(req['type'])
          processed_req['upload_count'] = count_uploaded_documents(req['type'])
          processed_req
        end
      end
      
      def get_uploaded_documents
        workflow_step.documents.includes(:company).order(:created_at)
      end
      
      def document_uploaded?(document_type)
        get_uploaded_documents.exists?(document_type: document_type)
      end
      
      def count_uploaded_documents(document_type)
        get_uploaded_documents.where(document_type: document_type).count
      end
      
      def validate_document(document_data)
        errors = []
        
        # Find matching requirement
        requirement = step_config['document_requirements']&.find do |req|
          req['type'] == document_data['document_type']
        end
        
        if requirement.nil?
          errors << 'Document type not recognized for this step'
          return { valid: false, errors: errors }
        end
        
        # Validate file size
        if requirement['max_size_mb'] && document_data['file_size_mb'] > requirement['max_size_mb']
          errors << "File size exceeds maximum of #{requirement['max_size_mb']}MB"
        end
        
        # Validate file format
        if requirement['accepted_formats']
          file_extension = document_data['file_name'].split('.').last&.upcase
          unless requirement['accepted_formats'].map(&:upcase).include?(file_extension)
            errors << "File format not accepted. Allowed: #{requirement['accepted_formats'].join(', ')}"
          end
        end
        
        # Check if multiple files are allowed
        unless requirement['multiple']
          existing_count = count_uploaded_documents(document_data['document_type'])
          if existing_count > 0
            errors << 'Only one file allowed for this document type'
          end
        end
        
        {
          valid: errors.empty?,
          errors: errors
        }
      end
      
      def create_document_record(document_data)
        workflow_step.documents.create!(
          company: workflow_step.workflow_instance.company,
          name: document_data['name'],
          document_type: document_data['document_type'],
          file_name: document_data['file_name'],
          file_size: document_data['file_size'],
          mime_type: document_data['mime_type'],
          storage_path: document_data['storage_path'],
          storage_bucket: document_data['storage_bucket'] || 'documents',
          uploaded_at: Time.current,
          metadata: {
            uploaded_by: document_data['uploaded_by'],
            original_filename: document_data['original_filename'],
            upload_session: document_data['upload_session']
          }
        )
      end
      
      def should_process_ocr?(document)
        # Process OCR for images and PDFs
        document.is_image? || document.is_pdf?
      end
      
      def generate_upload_url
        # This would generate a pre-signed URL for direct upload to Supabase Storage
        # For now, return a placeholder
        {
          upload_url: "#{ENV['SUPABASE_URL']}/storage/v1/upload",
          bucket: 'documents',
          expires_at: 1.hour.from_now.iso8601
        }
      end
    end
  end
end

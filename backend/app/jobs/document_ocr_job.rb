class DocumentOcrJob < ApplicationJob
  queue_as :default
  
  retry_on StandardError, attempts: 3, wait: :exponentially_longer
  
  def perform(document)
    Rails.logger.info "Starting OCR processing for document #{document.id}"
    
    begin
      # Update document status
      document.update!(ocr_status: 'processing')
      
      # Process based on document type
      result = if document.is_image?
                 process_image_with_gemini(document)
               elsif document.is_pdf?
                 process_pdf_with_gemini(document)
               else
                 { success: false, error: 'Unsupported file type for OCR' }
               end
      
      if result[:success]
        document.complete_processing!(result)
        Rails.logger.info "OCR completed successfully for document #{document.id}"
        
        # Trigger workflow step completion if this was the last required document
        check_workflow_step_completion(document)
      else
        document.fail_processing!(result[:error])
        Rails.logger.error "OCR failed for document #{document.id}: #{result[:error]}"
      end
      
    rescue => e
      document.fail_processing!(e.message)
      Rails.logger.error "OCR job failed for document #{document.id}: #{e.message}"
      raise e
    end
  end
  
  private
  
  def process_image_with_gemini(document)
    ocr_service = OcrService::GeminiProcessor.new
    
    # Download image from storage
    image_data = download_document(document)
    
    # Process with Gemini
    result = ocr_service.extract_from_image(image_data, document.document_type)
    
    {
      success: true,
      data: result[:extracted_fields] || {},
      confidence_score: result[:confidence_score] || 0.0,
      text: result[:extracted_text] || ''
    }
  rescue => e
    { success: false, error: e.message }
  end
  
  def process_pdf_with_gemini(document)
    ocr_service = OcrService::GeminiProcessor.new
    
    # Download PDF from storage
    pdf_data = download_document(document)
    
    # Convert PDF to images and process
    result = ocr_service.extract_from_pdf(pdf_data, document.document_type)
    
    {
      success: true,
      data: result[:extracted_fields] || {},
      confidence_score: result[:confidence_score] || 0.0,
      text: result[:extracted_text] || ''
    }
  rescue => e
    { success: false, error: e.message }
  end
  
  def download_document(document)
    # This would download from Supabase Storage
    # For now, return placeholder data
    Rails.logger.info "Downloading document from #{document.storage_path}"
    
    # In production, this would use Supabase client to download the file
    # storage_client = Supabase::Storage.new
    # storage_client.download(document.storage_bucket, document.storage_path)
    
    # Placeholder for development
    File.read(Rails.root.join('tmp', 'sample_document.pdf')) if File.exist?(Rails.root.join('tmp', 'sample_document.pdf'))
  rescue => e
    Rails.logger.error "Failed to download document: #{e.message}"
    raise "Document download failed: #{e.message}"
  end
  
  def check_workflow_step_completion(document)
    return unless document.workflow_step
    
    workflow_step = document.workflow_step
    return unless workflow_step.requires_documents?
    
    # Check if all required documents for this step are uploaded and processed
    handler = Workflow::StepHandlers::DocumentUploadHandler.new(workflow_step)
    completion_status = handler.check_completion_status
    
    if completion_status[:complete]
      # All documents uploaded, complete the workflow step
      WorkflowService.complete_step(workflow_step, {
        documents_processed: completion_status[:uploaded_count],
        ocr_completed_at: Time.current.iso8601
      })
    end
  end
end

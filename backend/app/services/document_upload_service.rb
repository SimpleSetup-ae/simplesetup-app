class DocumentUploadService
  class << self
    def generate_upload_url(company, file_name, content_type, workflow_step_id = nil)
      # Generate unique storage path
      timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
      unique_id = SecureRandom.hex(8)
      file_extension = File.extname(file_name)
      storage_file_name = "#{timestamp}_#{unique_id}#{file_extension}"
      
      storage_path = "#{company.id}/documents/#{Date.current.strftime('%Y/%m')}/#{storage_file_name}"
      bucket = 'documents'
      
      # In production, this would generate actual Supabase pre-signed URLs
      upload_url = generate_supabase_upload_url(bucket, storage_path, content_type)
      
      {
        upload_url: upload_url,
        storage_path: storage_path,
        bucket: bucket,
        expires_at: 1.hour.from_now.iso8601,
        max_file_size: 50.megabytes,
        metadata: {
          company_id: company.id,
          workflow_step_id: workflow_step_id,
          original_filename: file_name,
          upload_session: SecureRandom.hex(16)
        }
      }
    end
    
    def finalize_upload(company, upload_data, document_params)
      # Validate file was actually uploaded
      unless file_exists_in_storage?(upload_data[:bucket], upload_data[:storage_path])
        return { success: false, error: 'File upload verification failed' }
      end
      
      # Get actual file size from storage
      file_info = get_file_info(upload_data[:bucket], upload_data[:storage_path])
      
      # Create document record
      document = company.documents.build(
        name: document_params[:name] || upload_data[:metadata][:original_filename],
        document_type: document_params[:document_type],
        file_name: upload_data[:metadata][:original_filename],
        file_size: file_info[:size],
        mime_type: file_info[:content_type],
        storage_path: upload_data[:storage_path],
        storage_bucket: upload_data[:bucket],
        workflow_step_id: upload_data[:metadata][:workflow_step_id],
        uploaded_at: Time.current,
        metadata: {
          upload_session: upload_data[:metadata][:upload_session],
          uploaded_by: document_params[:uploaded_by] || 'system'
        }
      )
      
      if document.save
        # Queue OCR processing if the file type supports it
        if should_process_ocr?(document)
          DocumentOcrJob.perform_later(document)
        end
        
        { success: true, document: document }
      else
        { success: false, errors: document.errors.full_messages }
      end
    end
    
    def get_supported_file_types
      {
        images: %w[image/jpeg image/jpg image/png image/gif image/bmp image/webp image/heic image/heif],
        documents: %w[application/pdf application/msword application/vnd.openxmlformats-officedocument.wordprocessingml.document],
        text: %w[text/plain text/rtf text/csv],
        archives: %w[application/zip application/x-rar-compressed application/x-7z-compressed]
      }
    end
    
    def validate_file_upload(file_name, content_type, file_size)
      errors = []
      
      # Check file type
      supported_types = get_supported_file_types.values.flatten
      unless supported_types.include?(content_type)
        errors << "File type '#{content_type}' is not supported"
      end
      
      # Check file size (50MB max)
      max_size = 50.megabytes
      if file_size > max_size
        errors << "File size exceeds maximum of #{max_size / 1.megabyte}MB"
      end
      
      # Check file name
      if file_name.blank? || file_name.length > 255
        errors << "Invalid file name"
      end
      
      {
        valid: errors.empty?,
        errors: errors
      }
    end
    
    private
    
    def generate_supabase_upload_url(bucket, storage_path, content_type)
      # In production, this would use the Supabase client to generate pre-signed URLs
      # For development, return a mock URL
      "#{ENV['SUPABASE_URL']}/storage/v1/object/#{bucket}/#{storage_path}"
    end
    
    def file_exists_in_storage?(bucket, storage_path)
      # In production, this would check Supabase Storage
      # For development, always return true
      true
    end
    
    def get_file_info(bucket, storage_path)
      # In production, this would get actual file info from Supabase Storage
      # For development, return mock data
      {
        size: rand(100.kilobytes..10.megabytes),
        content_type: 'application/octet-stream',
        last_modified: Time.current
      }
    end
    
    def should_process_ocr?(document)
      ocr_supported_types = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
        'application/pdf'
      ]
      
      ocr_supported_types.include?(document.mime_type)
    end
  end
end

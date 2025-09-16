class Document < ApplicationRecord
  belongs_to :company
  belongs_to :workflow_step, optional: true
  belongs_to :user, optional: true
  belongs_to :person, optional: true
  
  validates :file_name, presence: true
  validates :file_size, presence: true, numericality: { greater_than: 0 }
  validates :content_type, presence: true
  validates :ocr_status, inclusion: { in: %w[pending processing completed failed] }, allow_nil: true
  
  # Document types
  DOCUMENT_TYPES = %w[
    passport emirates_id visa trade_license utility_bill 
    bank_statement noc_letter moa aoa board_resolution 
    power_of_attorney other
  ].freeze
  
  validates :document_type, inclusion: { in: DOCUMENT_TYPES }, allow_nil: true
  
  enum ocr_status: {
    pending: 'pending',
    processing: 'processing',
    completed: 'completed',
    failed: 'failed'
  }
  
  scope :processed, -> { where(ocr_status: 'completed') }
  scope :unprocessed, -> { where(ocr_status: ['pending', 'failed']) }
  scope :by_type, ->(type) { where(document_type: type) }
  scope :high_risk, -> { where("(fraud_assessment->>'risk_band')::text IN ('high', 'critical')") }
  scope :verified, -> { where(verified: true) }
  
  def file_size_mb
    (file_size / 1.megabyte.to_f).round(2)
  end
  
  def is_image?
    content_type&.start_with?('image/')
  end
  
  def is_pdf?
    content_type == 'application/pdf'
  end
  
  def mime_type
    content_type # Alias for backward compatibility
  end
  
  def name
    document_type&.humanize || file_name
  end
  
  def can_be_processed?
    %w[pending failed].include?(ocr_status)
  end
  
  def start_processing!
    update!(ocr_status: 'processing')
    # Trigger OCR job
    DocumentOcrJob.perform_later(self)
  end
  
  def complete_processing!(extracted_data)
    update!(
      ocr_status: 'completed',
      extracted_data: extracted_data[:data] || extracted_data,
      confidence_score: extracted_data[:confidence_score],
      extracted_text: extracted_data[:text],
      ocr_completed_at: Time.current
    )
  end
  
  def attach_file(file)
    # Upload to Supabase Storage instead of storing as Base64
    upload_to_supabase_storage(file)
  end
  
  # Upload file to Supabase storage
  def upload_to_supabase_storage(file, user_id = nil)
    return false unless file
    
    begin
      update!(ocr_status: 'pending') if ocr_status.blank?
      
      storage_service = SupabaseStorageService.new
      result = storage_service.upload_file(
        file, 
        generate_file_path(file), 
        company_id, 
        user_id
      )
      
      if result[:success]
        update!(
          storage_provider: 'supabase',
          bucket_name: SupabaseStorageService::BUCKET_NAME,
          file_path: result[:file_path],
          public_url: result[:public_url],
          signed_url: result[:signed_url],
          signed_url_expires_at: 1.hour.from_now,
          content_type: result[:metadata][:content_type],
          file_size: result[:metadata][:size],
          original_filename: result[:metadata][:original_filename],
          upload_status: 'completed',
          metadata: (metadata || {}).merge(result[:metadata]),
          file_name: result[:metadata][:original_filename],
          storage_path: result[:file_path]
        )
        true
      else
        update!(
          upload_status: 'failed',
          upload_error: result[:error]
        )
        false
      end
    rescue => e
      update!(
        upload_status: 'failed',
        upload_error: e.message
      )
      Rails.logger.error "Document upload failed: #{e.message}"
      false
    end
  end
  
  def fraud_risk_level
    fraud_assessment&.dig('risk_band') || 'unknown'
  end
  
  def passport_data
    return nil unless document_type == 'passport'
    extracted_data
  end
  
  def fail_processing!(error_message)
    update!(
      ocr_status: 'failed',
      metadata: metadata.merge(error: error_message)
    )
  end
  
  def download_url
    # Generate pre-signed URL for secure download
    get_signed_url
  end
  
  # Get a fresh signed URL (regenerate if expired)
  def get_signed_url(expires_in = 1.hour)
    return signed_url if signed_url.present? && signed_url_expires_at&.future?
    
    return nil unless file_path.present?
    
    storage_service = SupabaseStorageService.new
    new_signed_url = storage_service.get_signed_url(file_path, expires_in)
    
    if new_signed_url
      update!(
        signed_url: new_signed_url,
        signed_url_expires_at: expires_in.from_now
      )
      new_signed_url
    else
      signed_url # Return existing URL even if potentially expired
    end
  end
  
  # Delete file from storage
  def delete_from_storage
    return true unless file_path.present?
    
    storage_service = SupabaseStorageService.new
    result = storage_service.delete_file(file_path)
    
    if result[:success]
      update!(
        file_path: nil,
        public_url: nil,
        signed_url: nil,
        signed_url_expires_at: nil,
        upload_status: 'pending'
      )
    end
    
    result[:success]
  end
  
  # Check if file is accessible
  def accessible?
    upload_status == 'completed' && file_path.present?
  end
  
  # Get file URL for display (signed URL with fallback)
  def display_url
    accessible? ? get_signed_url : nil
  end
  
  private
  
  def generate_file_path(file)
    category = document_category || document_type || 'documents'
    timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
    extension = File.extname(file.original_filename)
    filename = File.basename(file.original_filename, extension)
    
    "#{category}/#{timestamp}_#{filename}#{extension}"
  end
end

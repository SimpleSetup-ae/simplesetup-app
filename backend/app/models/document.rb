class Document < ApplicationRecord
  belongs_to :company
  belongs_to :workflow_step, optional: true
  
  validates :name, presence: true
  validates :file_name, presence: true
  validates :file_size, presence: true, numericality: { greater_than: 0 }
  validates :mime_type, presence: true
  validates :storage_path, presence: true, uniqueness: true
  validates :ocr_status, inclusion: { in: %w[pending processing completed failed] }
  
  enum ocr_status: {
    pending: 'pending',
    processing: 'processing',
    completed: 'completed',
    failed: 'failed'
  }
  
  scope :processed, -> { where(ocr_status: 'completed') }
  scope :unprocessed, -> { where(ocr_status: ['pending', 'failed']) }
  
  def file_size_mb
    (file_size / 1.megabyte.to_f).round(2)
  end
  
  def is_image?
    mime_type.start_with?('image/')
  end
  
  def is_pdf?
    mime_type == 'application/pdf'
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
      ocr_data: extracted_data[:data] || {},
      confidence_score: extracted_data[:confidence_score],
      extracted_text: extracted_data[:text],
      processed_at: Time.current
    )
  end
  
  def fail_processing!(error_message)
    update!(
      ocr_status: 'failed',
      metadata: metadata.merge(error: error_message)
    )
  end
  
  def download_url
    # Generate pre-signed URL for download
    # This will be implemented with Supabase Storage
    "#{ENV['SUPABASE_URL']}/storage/v1/object/#{storage_bucket}/#{storage_path}"
  end
end

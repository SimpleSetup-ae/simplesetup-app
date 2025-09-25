class DocumentSerializer < BaseSerializer
  def self.serialize(document, options = {})
    # Handle both positional and keyword arguments
    if options.is_a?(Hash)
      include_urls = options[:include_urls] || false
      admin = options[:admin] || false
    else
      # Legacy support for keyword arguments
      include_urls = options
      admin = false
    end
    data = {
      id: document.id,
      name: document.name,
      document_type: document.document_type,
      document_category: document.document_category,
      file_name: document.file_name,
      file_size: document.file_size,
      content_type: document.try(:content_type),
      uploaded_at: (document.respond_to?(:uploaded_at) ? document.uploaded_at : document.created_at)&.iso8601,
      ocr_status: document.try(:ocr_status),
      verified: document.try(:verified),
      extracted_data: admin ? document.try(:extracted_data) : nil
    }.compact

    if include_urls && document.respond_to?(:storage_path) && document.storage_path.present?
      begin
        url = SupabaseStorageService.get_signed_url(document.storage_path, expires_in: 3600)
        data[:display_url] = url
        data[:download_url] = url
      rescue => e
        Rails.logger.warn "[DocumentSerializer] URL generation failed for #{document.id}: #{e.message}"
      end
    end

    data
  end
end



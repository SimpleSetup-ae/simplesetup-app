class SupabaseStorageService
  include ActiveModel::Model
  
  BUCKET_NAME = 'company-documents'.freeze
  ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'application/pdf'
  ].freeze
  
  MAX_FILE_SIZE = 10.megabytes
  
  attr_reader :supabase_url, :supabase_service_key
  
  def initialize
    @supabase_url = ENV['SUPABASE_URL']
    @supabase_service_key = ENV['SUPABASE_SERVICE_KEY']
    
    validate_configuration
  end
  
  # Upload a file to Supabase Storage
  def upload_file(file, file_path, company_id, user_id = nil)
    validate_file(file)
    
    # Create organized file path: company_id/document_type/filename
    organized_path = organize_file_path(file_path, company_id)
    
    begin
      response = upload_to_supabase(file, organized_path)
      
      if response.success?
        {
          success: true,
          file_path: organized_path,
          public_url: get_public_url(organized_path),
          signed_url: get_signed_url(organized_path),
          metadata: {
            size: file.size,
            content_type: file.content_type,
            original_filename: file.original_filename,
            uploaded_at: Time.current,
            company_id: company_id,
            user_id: user_id
          }
        }
      else
        {
          success: false,
          error: "Upload failed: #{response.body}"
        }
      end
    rescue => e
      Rails.logger.error "Supabase upload error: #{e.message}"
      {
        success: false,
        error: "Upload service error: #{e.message}"
      }
    end
  end
  
  # Generate a signed URL for secure access
  def get_signed_url(file_path, expires_in = 1.hour)
    begin
      uri = URI("#{@supabase_url}/storage/v1/object/sign/#{BUCKET_NAME}/#{file_path}")
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      
      request = Net::HTTP::Post.new(uri)
      request['Authorization'] = "Bearer #{@supabase_service_key}"
      request['Content-Type'] = 'application/json'
      request.body = { expiresIn: expires_in.to_i }.to_json
      
      response = http.request(request)
      
      if response.code == '200'
        result = JSON.parse(response.body)
        "#{@supabase_url}#{result['signedURL']}"
      else
        Rails.logger.error "Failed to generate signed URL: #{response.body}"
        nil
      end
    rescue => e
      Rails.logger.error "Signed URL generation error: #{e.message}"
      nil
    end
  end
  
  # Get public URL (for non-sensitive files)
  def get_public_url(file_path)
    "#{@supabase_url}/storage/v1/object/public/#{BUCKET_NAME}/#{file_path}"
  end
  
  # Delete a file from Supabase Storage
  def delete_file(file_path)
    begin
      uri = URI("#{@supabase_url}/storage/v1/object/#{BUCKET_NAME}/#{file_path}")
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      
      request = Net::HTTP::Delete.new(uri)
      request['Authorization'] = "Bearer #{@supabase_service_key}"
      
      response = http.request(request)
      
      {
        success: response.code == '200',
        message: response.code == '200' ? 'File deleted successfully' : response.body
      }
    rescue => e
      Rails.logger.error "File deletion error: #{e.message}"
      {
        success: false,
        message: "Deletion failed: #{e.message}"
      }
    end
  end
  
  # List files in a company's folder
  def list_company_files(company_id, folder = nil)
    begin
      path = folder ? "#{company_id}/#{folder}" : company_id.to_s
      uri = URI("#{@supabase_url}/storage/v1/object/list/#{BUCKET_NAME}?prefix=#{path}")
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      
      request = Net::HTTP::Get.new(uri)
      request['Authorization'] = "Bearer #{@supabase_service_key}"
      
      response = http.request(request)
      
      if response.code == '200'
        files = JSON.parse(response.body)
        files.map do |file|
          {
            name: file['name'],
            size: file['metadata']['size'],
            content_type: file['metadata']['mimetype'],
            updated_at: file['updated_at'],
            file_path: "#{path}/#{file['name']}",
            signed_url: get_signed_url("#{path}/#{file['name']}")
          }
        end
      else
        []
      end
    rescue => e
      Rails.logger.error "File listing error: #{e.message}"
      []
    end
  end
  
  # Create storage bucket policies for Row Level Security
  def setup_bucket_policies
    policies = [
      # Allow authenticated users to upload to their company folder
      {
        name: "Allow company document uploads",
        definition: "(bucket_id = 'company-documents') AND (auth.uid() IS NOT NULL)",
        action: "INSERT"
      },
      # Allow users to read their company's documents  
      {
        name: "Allow company document access",
        definition: "(bucket_id = 'company-documents') AND (auth.uid() IS NOT NULL)",
        action: "SELECT"
      },
      # Allow users to delete their company's documents
      {
        name: "Allow company document deletion", 
        definition: "(bucket_id = 'company-documents') AND (auth.uid() IS NOT NULL)",
        action: "DELETE"
      }
    ]
    
    # Note: These policies would be created via Supabase dashboard or SQL
    # This method documents the required policies
    policies
  end
  
  private
  
  def validate_configuration
    unless @supabase_url && @supabase_service_key
      raise "Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY"
    end
  end
  
  def validate_file(file)
    # Check file size
    if file.size > MAX_FILE_SIZE
      raise "File size #{file.size} exceeds maximum allowed size of #{MAX_FILE_SIZE}"
    end
    
    # Check MIME type
    unless ALLOWED_MIME_TYPES.include?(file.content_type)
      raise "File type #{file.content_type} is not allowed. Allowed types: #{ALLOWED_MIME_TYPES.join(', ')}"
    end
  end
  
  def organize_file_path(file_path, company_id)
    # Extract document type from file path or filename
    document_type = extract_document_type(file_path)
    timestamp = Time.current.strftime("%Y%m%d_%H%M%S")
    filename = File.basename(file_path)
    
    "#{company_id}/#{document_type}/#{timestamp}_#{filename}"
  end
  
  def extract_document_type(file_path)
    filename = File.basename(file_path).downcase
    
    case filename
    when /passport/
      'passports'
    when /license|certificate/
      'licenses'
    when /bank|financial/
      'financial'
    when /memorandum|articles/
      'corporate'
    else
      'documents'
    end
  end
  
  def upload_to_supabase(file, file_path)
    uri = URI("#{@supabase_url}/storage/v1/object/#{BUCKET_NAME}/#{file_path}")
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Post.new(uri)
    request['Authorization'] = "Bearer #{@supabase_service_key}"
    request['Content-Type'] = file.content_type
    request.body = file.read
    
    http.request(request)
  end
end

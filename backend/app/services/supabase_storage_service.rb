require 'net/http'
require 'uri'

class SupabaseStorageService
  class << self
    def upload_file(file:, path:, bucket: 'documents')
      supabase_url = ENV['SUPABASE_URL']
      supabase_key = ENV['SUPABASE_SERVICE_KEY']
      
      Rails.logger.info "[SupabaseStorage] Starting upload to path: #{path}"
      Rails.logger.info "[SupabaseStorage] Bucket: #{bucket}"
      Rails.logger.info "[SupabaseStorage] File class: #{file.class.name}"
      
      if supabase_url.blank? || supabase_key.blank?
        Rails.logger.error "[SupabaseStorage] Supabase credentials not configured"
        return { success: false, error: 'Storage not configured' }
      end
      
      # Prepare file content
      file_content = file.is_a?(String) ? File.read(file) : file.read
      Rails.logger.info "[SupabaseStorage] File content size: #{file_content.size} bytes"
      
      # Build URL
      url = URI("#{supabase_url}/storage/v1/object/#{bucket}/#{path}")
      Rails.logger.info "[SupabaseStorage] Upload URL: #{url}"
      
      # Create request
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true
      
      request = Net::HTTP::Post.new(url)
      request['Authorization'] = "Bearer #{supabase_key}"
      request['Content-Type'] = file.content_type rescue 'application/octet-stream'
      request.body = file_content
      
      Rails.logger.info "[SupabaseStorage] Sending upload request..."
      # Execute request
      response = http.request(request)
      Rails.logger.info "[SupabaseStorage] Response code: #{response.code}"
      
      if response.code == '200'
        public_url = "#{supabase_url}/storage/v1/object/public/#{bucket}/#{path}"
        Rails.logger.info "[SupabaseStorage] Upload successful, public URL: #{public_url}"
        { success: true, url: public_url, path: path }
      else
        Rails.logger.error "[SupabaseStorage] Upload failed: #{response.code}"
        Rails.logger.error "[SupabaseStorage] Response body: #{response.body}"
        { success: false, error: response.body }
      end
    rescue => e
      Rails.logger.error "Supabase upload error: #{e.message}"
      { success: false, error: e.message }
    end
    
    def delete_file(path, bucket: 'documents')
      supabase_url = ENV['SUPABASE_URL']
      supabase_key = ENV['SUPABASE_SERVICE_KEY']
      
      return false if supabase_url.blank? || supabase_key.blank?
      
      url = URI("#{supabase_url}/storage/v1/object/#{bucket}/#{path}")
      
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true
      
      request = Net::HTTP::Delete.new(url)
      request['Authorization'] = "Bearer #{supabase_key}"
      
      response = http.request(request)
      response.code == '200'
    rescue => e
      Rails.logger.error "Supabase delete error: #{e.message}"
      false
    end
    
    def get_public_url(path, bucket: 'documents')
      supabase_url = ENV['SUPABASE_URL']
      return nil if supabase_url.blank?
      
      "#{supabase_url}/storage/v1/object/public/#{bucket}/#{path}"
    end
    
    def get_signed_url(path, bucket: 'documents', expires_in: 3600)
      supabase_url = ENV['SUPABASE_URL']
      supabase_key = ENV['SUPABASE_SERVICE_KEY']
      
      return nil if supabase_url.blank? || supabase_key.blank?
      
      url = URI("#{supabase_url}/storage/v1/object/sign/#{bucket}/#{path}")
      
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true
      
      request = Net::HTTP::Post.new(url)
      request['Authorization'] = "Bearer #{supabase_key}"
      request['Content-Type'] = 'application/json'
      request.body = { expiresIn: expires_in }.to_json
      
      response = http.request(request)
      
      if response.code == '200'
        result = JSON.parse(response.body)
        "#{supabase_url}#{result['signedURL']}"
      else
        Rails.logger.error "Failed to get signed URL: #{response.body}"
        nil
      end
    rescue => e
      Rails.logger.error "Supabase signed URL error: #{e.message}"
      nil
    end
    
    def create_bucket(name, public: false)
      supabase_url = ENV['SUPABASE_URL']
      supabase_key = ENV['SUPABASE_SERVICE_KEY']
      
      return false if supabase_url.blank? || supabase_key.blank?
      
      url = URI("#{supabase_url}/storage/v1/bucket")
      
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true
      
      request = Net::HTTP::Post.new(url)
      request['Authorization'] = "Bearer #{supabase_key}"
      request['Content-Type'] = 'application/json'
      request.body = { 
        name: name, 
        public: public,
        file_size_limit: 10485760, # 10MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'application/pdf']
      }.to_json
      
      response = http.request(request)
      response.code == '200'
    rescue => e
      Rails.logger.error "Bucket creation error: #{e.message}"
      false
    end
  end
end
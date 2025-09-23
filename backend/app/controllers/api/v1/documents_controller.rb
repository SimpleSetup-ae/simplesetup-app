class Api::V1::DocumentsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:upload, :extract_passport]
  skip_jwt_auth :upload, :extract_passport
  before_action :set_company
  before_action :set_document, only: [:show, :destroy]
  
  # POST /api/v1/applications/:application_id/documents
  def upload
    unless params[:file]
      render json: { success: false, message: 'No file provided' }, status: :bad_request
      return
    end
    
    file = params[:file]
    document_type = params[:document_type] || 'general'
    document_category = params[:document_category] || 'other'
    
    # Create document record
    @document = @company.documents.build(
      name: params[:name] || file.original_filename,
      document_type: document_type,
      document_category: document_category,
      file_name: file.original_filename,
      file_size: file.size,
      content_type: file.content_type,
      user_id: current_user&.id,
      person_id: params[:person_id],
      uploaded_at: Time.current
    )
    
    # Generate storage path
    storage_path = generate_storage_path(@company, document_category, file.original_filename)
    @document.storage_path = storage_path
    @document.storage_bucket = 'documents'
    
    # Upload to Supabase Storage
    begin
      upload_result = SupabaseStorageService.upload_file(
        file: file,
        path: storage_path,
        bucket: 'documents'
      )
      
      if upload_result[:success]
        @document.save!
        
        render json: {
          success: true,
          document: serialize_document(@document),
          url: upload_result[:url]
        }
      else
        render json: {
          success: false,
          message: 'Failed to upload file to storage'
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Document upload failed: #{e.message}"
      render json: {
        success: false,
        message: 'Upload failed. Please try again.'
      }, status: :internal_server_error
    end
  end
  
  # POST /api/v1/applications/:application_id/documents/extract_passport
  def extract_passport
    Rails.logger.info "[DocumentsController] Passport extraction request received"
    Rails.logger.info "[DocumentsController] Application ID: #{params[:application_id]}"
    Rails.logger.info "[DocumentsController] File present: #{params[:file].present?}"
    Rails.logger.info "[DocumentsController] Document ID: #{params[:document_id]}"
    
    unless params[:file] || params[:document_id]
      Rails.logger.error "[DocumentsController] No file or document ID provided"
      render json: { success: false, message: 'No file or document ID provided' }, status: :bad_request
      return
    end
    
    # Get file URL
    if params[:document_id]
      document = @company.documents.find(params[:document_id])
      file_url = SupabaseStorageService.get_public_url(document.storage_path)
      Rails.logger.info "[DocumentsController] Using existing document: #{document.id}"
    else
      # Upload temp file and get URL
      file = params[:file]
      Rails.logger.info "[DocumentsController] Uploading file: #{file.original_filename}, size: #{file.size}"
      temp_path = "temp/ocr/#{SecureRandom.uuid}/#{file.original_filename}"
      upload_result = SupabaseStorageService.upload_file(
        file: file,
        path: temp_path,
        bucket: 'documents'
      )
      file_url = upload_result[:url]
      Rails.logger.info "[DocumentsController] File uploaded to: #{file_url}"
    end
    
    # Extract using AI services
    begin
      Rails.logger.info "[DocumentsController] Starting passport extraction..."
      extraction_result = PassportExtractionService.extract(file_url)
      Rails.logger.info "[DocumentsController] Extraction result: #{extraction_result[:success] ? 'Success' : 'Failed'}"
      
      if extraction_result[:success]
        # Store extraction results if document exists
        if document
          document.update!(
            ocr_status: 'completed',
            ocr_completed_at: Time.current,
            extracted_data: extraction_result[:data],
            confidence_score: extraction_result[:confidence]
          )
        end
        
        # Save confidence score to person if person_id is provided
        if params[:person_id].present?
          person = @company.people.find_by(id: params[:person_id])
          if person
            person.update!(passport_extraction_confidence: extraction_result[:confidence])
            Rails.logger.info "[DocumentsController] Updated person #{person.id} with confidence score: #{extraction_result[:confidence]}"
          else
            Rails.logger.warn "[DocumentsController] Person not found with id: #{params[:person_id]}"
          end
        end
        
        render json: {
          success: true,
          extracted: extraction_result[:data],
          confidence: extraction_result[:confidence],
          service_used: extraction_result[:service]
        }
      else
        render json: {
          success: false,
          message: extraction_result[:error] || 'Extraction failed'
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "[DocumentsController] Passport extraction failed: #{e.class.name}: #{e.message}"
      Rails.logger.error "[DocumentsController] Backtrace: #{e.backtrace.first(5).join("\n")}"
      render json: {
        success: false,
        message: 'Failed to extract passport information'
      }, status: :internal_server_error
    end
  end
  
  # GET /api/v1/applications/:application_id/documents
  def index
    documents = @company.documents.order(uploaded_at: :desc)
    
    # Filter by category if provided
    if params[:category].present?
      documents = documents.where(document_category: params[:category])
    end
    
    render json: {
      success: true,
      documents: DocumentSerializer.collection(documents, include_urls: false)
    }
  end
  
  # GET /api/v1/applications/:application_id/documents/:id
  def show
    render json: {
      success: true,
      document: DocumentSerializer.serialize(@document, include_urls: true)
    }
  end
  
  # DELETE /api/v1/applications/:application_id/documents/:id
  def destroy
    # Delete from Supabase
    SupabaseStorageService.delete_file(@document.storage_path)
    
    # Delete record
    @document.destroy!
    
    render json: {
      success: true,
      message: 'Document deleted successfully'
    }
  end
  
  private
  
  def set_company
    @company = Company.find(params[:application_id])
    
    # Check access
    if current_user && !@company.can_be_accessed_by?(current_user)
      render json: { error: 'Unauthorized' }, status: :forbidden
    end
  end
  
  def set_document
    @document = @company.documents.find(params[:id])
  end
  
  def generate_storage_path(company, category, filename)
    # Structure: documents/companies/{company_id}/{category}/{timestamp}_{filename}
    timestamp = Time.current.strftime('%Y%m%d%H%M%S')
    safe_filename = filename.gsub(/[^0-9A-Za-z.\-]/, '_')
    
    "companies/#{company.id}/#{category}/#{timestamp}_#{safe_filename}"
  end
  
  # serialization handled by DocumentSerializer
end
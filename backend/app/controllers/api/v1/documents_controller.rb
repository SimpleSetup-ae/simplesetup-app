class Api::V1::DocumentsController < Api::V1::BaseController
  before_action :set_company, only: [:index, :create, :show, :destroy]
  before_action :set_document, only: [:show, :destroy, :download]
  before_action :authorize_company_access, only: [:index, :create, :show, :destroy]

  # GET /api/v1/companies/:company_id/documents
  def index
    @documents = @company.documents.includes(:user, :person)
    
    # Apply filters
    @documents = @documents.by_type(params[:document_type]) if params[:document_type].present?
    @documents = @documents.where(person_id: params[:person_id]) if params[:person_id].present?
    @documents = @documents.where(upload_status: params[:upload_status]) if params[:upload_status].present?
    
    render json: {
      success: true,
      data: @documents.map do |doc|
        {
          id: doc.id,
          name: doc.name,
          file_name: doc.file_name,
          original_filename: doc.original_filename,
          document_type: doc.document_type,
          document_category: doc.document_category,
          content_type: doc.content_type,
          file_size: doc.file_size,
          human_file_size: doc.file_size_mb,
          upload_status: doc.upload_status,
          upload_error: doc.upload_error,
          person_id: doc.person_id,
          is_image: doc.is_image?,
          is_pdf: doc.is_pdf?,
          accessible: doc.accessible?,
          display_url: doc.display_url,
          created_at: doc.created_at,
          updated_at: doc.updated_at
        }
      end
    }
  end

  # POST /api/v1/companies/:company_id/documents
  def create
    uploaded_files = params[:files] || []
    results = []
    errors = []

    uploaded_files.each_with_index do |file, index|
      begin
        document = @company.documents.build(
          file_name: file.original_filename,
          content_type: file.content_type,
          file_size: file.size,
          document_type: determine_document_type(file.original_filename),
          document_category: params[:document_category] || determine_category(file.original_filename),
          person_id: params[:person_id],
          user: current_user,
          upload_status: 'pending'
        )

        if document.save
          # Upload to Supabase Storage
          if document.upload_to_supabase_storage(file, current_user&.id)
            results << {
              id: document.id,
              name: document.name,
              file_name: document.file_name,
              upload_status: 'completed',
              display_url: document.display_url
            }
            
            # Trigger OCR processing if it's a document that can be processed
            if document.can_be_processed? && document.document_type.in?(['passport', 'emirates_id', 'visa'])
              document.start_processing!
            end
          else
            errors << {
              file: file.original_filename,
              error: document.upload_error || 'Upload failed'
            }
          end
        else
          errors << {
            file: file.original_filename,
            error: document.errors.full_messages.join(', ')
          }
        end
      rescue => e
        Rails.logger.error "Document upload error: #{e.message}"
        errors << {
          file: file.original_filename,
          error: "Upload failed: #{e.message}"
        }
      end
    end

    if errors.empty?
      render json: {
        success: true,
        data: results,
        message: "#{results.count} file(s) uploaded successfully"
      }
    elsif results.any?
      render json: {
        success: true,
        data: results,
        errors: errors,
        message: "#{results.count} file(s) uploaded, #{errors.count} failed"
      }, status: :partial_content
    else
      render json: {
        success: false,
        errors: errors,
        message: "All uploads failed"
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/documents/:id
  def show
    render json: {
      success: true,
      data: {
        id: @document.id,
        name: @document.name,
        file_name: @document.file_name,
        original_filename: @document.original_filename,
        document_type: @document.document_type,
        document_category: @document.document_category,
        content_type: @document.content_type,
        file_size: @document.file_size,
        human_file_size: @document.file_size_mb,
        upload_status: @document.upload_status,
        upload_error: @document.upload_error,
        ocr_status: @document.ocr_status,
        person_id: @document.person_id,
        is_image: @document.is_image?,
        is_pdf: @document.is_pdf?,
        accessible: @document.accessible?,
        display_url: @document.display_url,
        download_url: @document.download_url,
        extracted_data: @document.extracted_data,
        confidence_score: @document.confidence_score,
        fraud_risk_level: @document.fraud_risk_level,
        created_at: @document.created_at,
        updated_at: @document.updated_at
      }
    }
  end

  # DELETE /api/v1/documents/:id
  def destroy
    begin
      # Delete from storage first
      if @document.delete_from_storage
        @document.destroy!
        render json: {
          success: true,
          message: 'Document deleted successfully'
        }
      else
        render json: {
          success: false,
          error: 'Failed to delete file from storage'
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Document deletion error: #{e.message}"
      render json: {
        success: false,
        error: "Deletion failed: #{e.message}"
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/documents/:id/download
  def download
    unless @document.accessible?
      render json: {
        success: false,
        error: 'Document not accessible'
      }, status: :not_found
      return
    end

    download_url = @document.get_signed_url(1.hour)
    
    if download_url
      render json: {
        success: true,
        download_url: download_url,
        expires_at: 1.hour.from_now
      }
    else
      render json: {
        success: false,
        error: 'Unable to generate download URL'
      }, status: :unprocessable_entity
    end
  end

  private

  def set_company
    @company = Company.find(params[:company_id])
  end

  def set_document
    if params[:company_id]
      @document = @company.documents.find(params[:id])
    else
      @document = Document.find(params[:id])
    end
  end

  def authorize_company_access
    unless @company.can_be_accessed_by?(current_user)
      render json: { 
        success: false, 
        error: 'Access denied' 
      }, status: :forbidden
    end
  end

  def determine_document_type(filename)
    filename_lower = filename.downcase
    
    case filename_lower
    when /passport/
      'passport'
    when /emirates.*id|eid/
      'emirates_id'
    when /visa/
      'visa'
    when /license|trade/
      'trade_license'
    when /utility|bill/
      'utility_bill'
    when /bank.*statement/
      'bank_statement'
    when /noc/
      'noc_letter'
    when /moa|memorandum/
      'moa'
    when /aoa|articles/
      'aoa'
    when /resolution/
      'board_resolution'
    when /power.*attorney|poa/
      'power_of_attorney'
    else
      'other'
    end
  end

  def determine_category(filename)
    filename_lower = filename.downcase
    
    case filename_lower
    when /passport/
      'passport'
    when /license|certificate/
      'license'
    when /bank|financial/
      'financial'
    when /memorandum|articles|resolution|poa/
      'corporate'
    else
      'other'
    end
  end
end
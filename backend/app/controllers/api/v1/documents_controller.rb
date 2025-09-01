class Api::V1::DocumentsController < ApplicationController
  before_action :set_document, only: [:show, :ocr]
  before_action :set_company, only: [:index, :create, :upload_url]
  before_action :authorize_document_access
  
  def index
    @documents = @company.documents
                         .includes(:workflow_step)
                         .order(created_at: :desc)
    
    render json: {
      success: true,
      data: @documents.map { |doc| serialize_document(doc) }
    }
  end
  
  def show
    render json: {
      success: true,
      data: serialize_document_detailed(@document)
    }
  end
  
  def create
    @document = @company.documents.build(document_params)
    @document.uploaded_at = Time.current
    
    if @document.save
      render json: {
        success: true,
        data: serialize_document_detailed(@document),
        message: 'Document created successfully'
      }, status: :created
    else
      render json: {
        success: false,
        errors: @document.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  def upload_url
    file_name = params[:file_name]
    content_type = params[:content_type]
    file_size = params[:file_size]&.to_i
    workflow_step_id = params[:workflow_step_id]
    
    # Validate file
    validation = DocumentUploadService.validate_file_upload(file_name, content_type, file_size)
    
    unless validation[:valid]
      return render json: {
        success: false,
        errors: validation[:errors]
      }, status: :unprocessable_entity
    end
    
    # Generate upload URL
    upload_data = DocumentUploadService.generate_upload_url(
      @company, 
      file_name, 
      content_type, 
      workflow_step_id
    )
    
    render json: {
      success: true,
      data: upload_data
    }
  end
  
  def ocr
    unless @document.can_be_processed?
      return render json: {
        success: false,
        error: 'Document cannot be processed'
      }, status: :unprocessable_entity
    end
    
    # Queue OCR processing job
    DocumentOcrJob.perform_later(@document)
    
    @document.update!(ocr_status: 'processing')
    
    render json: {
      success: true,
      data: serialize_document(@document),
      message: 'OCR processing queued'
    }
  end
  
  private
  
  def set_document
    @document = Document.find(params[:id])
    @company = @document.company
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Document not found'
    }, status: :not_found
  end
  
  def set_company
    @company = current_user.companies.find(params[:company_id]) if params[:company_id]
    @company ||= Document.find(params[:document_id]).company if params[:document_id]
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found or access denied'
    }, status: :not_found
  end
  
  def authorize_document_access
    unless @company.can_be_accessed_by?(current_user)
      render json: {
        success: false,
        error: 'Access denied'
      }, status: :forbidden
    end
  end
  
  def document_params
    params.require(:document).permit(
      :name, :document_type, :file_name, :file_size, 
      :mime_type, :storage_path, :storage_bucket,
      :workflow_step_id, metadata: {}
    )
  end
  
  def serialize_document(document)
    {
      id: document.id,
      name: document.name,
      document_type: document.document_type,
      file_name: document.file_name,
      file_size: document.file_size,
      file_size_mb: document.file_size_mb,
      mime_type: document.mime_type,
      ocr_status: document.ocr_status,
      confidence_score: document.confidence_score,
      uploaded_at: document.uploaded_at&.iso8601,
      processed_at: document.processed_at&.iso8601,
      download_url: document.download_url,
      workflow_step: document.workflow_step ? {
        id: document.workflow_step.id,
        title: document.workflow_step.title,
        step_number: document.workflow_step.step_number
      } : nil
    }
  end
  
  def serialize_document_detailed(document)
    base_data = serialize_document(document)
    
    base_data.merge({
      ocr_data: document.ocr_data,
      extracted_text: document.extracted_text,
      metadata: document.metadata,
      storage_path: document.storage_path,
      storage_bucket: document.storage_bucket
    })
  end
end

require 'ostruct'
require 'securerandom'

class Api::V1::PassportController < Api::V1::BaseController
  # Temporarily skip authentication for testing
  # before_action :authenticate_user!
  
  # POST /api/v1/documents/passport/extract
  def extract
    file = params[:file]
    entity_type = params[:entity_type]
    entity_name = params[:entity_name]
    
    unless file.present?
      return render json: { error: 'No file provided' }, status: :unprocessable_entity
    end
    
    # Validate file type and size
    unless valid_file?(file)
      return render json: { error: 'Invalid file format or size' }, status: :unprocessable_entity
    end
    
    begin
      # For testing without database, create a mock document object
      document = OpenStruct.new(
        id: SecureRandom.uuid,
        file_name: file.respond_to?(:original_filename) ? file.original_filename : 'passport.jpg',
        file_size: file.respond_to?(:size) ? file.size : file.length,
        content_type: file.respond_to?(:content_type) ? file.content_type : 'image/jpeg',
        file_data: file
      )
      
      # Process with OpenAI
      passport_data = PassportExtractionService.new(document).extract
      
      render json: {
        file_id: document.id,
        passport: passport_data
      }
      
    rescue StandardError => e
      Rails.logger.error "Passport extraction failed: #{e.message}"
      render json: { error: 'Failed to process passport' }, status: :internal_server_error
    end
  end
  
  # POST /api/v1/documents/passport/fraud-check
  def fraud_check
    passport_data = params[:passport_data]
    file_id = params[:file_id]
    
    unless passport_data.present?
      return render json: { error: 'No passport data provided' }, status: :unprocessable_entity
    end
    
    begin
      # For testing without database
      document = nil
      
      # Perform fraud detection
      fraud_result = PassportFraudDetectionService.new(passport_data, document).analyze
      
      render json: {
        fraud_assessment: fraud_result
      }
      
    rescue StandardError => e
      Rails.logger.error "Fraud detection failed: #{e.message}"
      render json: { error: 'Failed to perform fraud check' }, status: :internal_server_error
    end
  end
  
  private
  
  def valid_file?(file)
    valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    max_size = 10.megabytes
    
    valid_types.include?(file.content_type) && file.size <= max_size
  end
  
  def current_company
    # Return nil for testing without authentication
    nil
  end
end

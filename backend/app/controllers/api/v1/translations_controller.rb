class Api::V1::TranslationsController < Api::V1::BaseController
  skip_before_action :authenticate_user!
  skip_jwt_auth :arabic, :limit
  before_action :check_translation_limit
  
  # POST /api/v1/translations/arabic
  def arabic
    text = params[:text]&.strip
    
    if text.blank?
      render json: {
        success: false,
        message: 'Text is required for translation'
      }, status: :bad_request
      return
    end
    
    # Check if text is too long (prevent abuse)
    if text.length > 200
      render json: {
        success: false,
        message: 'Text is too long. Maximum 200 characters allowed.'
      }, status: :bad_request
      return
    end
    
    # Perform translation
    begin
      translation_result = TranslationService.translate_to_arabic(text)
      
      if translation_result[:success]
        # Increment user's translation count (only for authenticated users)
        current_user&.increment_translation_count!
        
        render json: {
          success: true,
          original: text,
          translated: translation_result[:translation],
          remaining_requests: current_user&.remaining_translation_requests || 100
        }
      else
        render json: {
          success: false,
          message: translation_result[:error] || 'Translation failed'
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Translation error: #{e.message}"
      render json: {
        success: false,
        message: 'Translation service temporarily unavailable'
      }, status: :service_unavailable
    end
  end
  
  # GET /api/v1/translations/limit
  def limit
    if current_user
      render json: {
        success: true,
        used: current_user.translation_requests_count,
        limit: 100,
        remaining: current_user.remaining_translation_requests,
        resets_at: current_user.translation_requests_reset_at
      }
    else
      # Anonymous users get a generous limit
      render json: {
        success: true,
        used: 0,
        limit: 100,
        remaining: 100,
        resets_at: nil
      }
    end
  end
  
  private
  
  def check_translation_limit
    # Skip limit check for anonymous users (they can translate up to 5 times per session)
    return unless current_user
    
    # Reset counter if month has passed
    current_user.reset_translation_counter_if_needed!
    
    # Check if user has exceeded limit
    if current_user.translation_requests_count >= 100
      render json: {
        success: false,
        message: 'Monthly translation limit exceeded (100 requests)',
        resets_at: current_user.translation_requests_reset_at
      }, status: :too_many_requests
    end
  end
end

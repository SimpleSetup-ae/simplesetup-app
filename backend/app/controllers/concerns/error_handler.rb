module ErrorHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid
    rescue_from ActiveRecord::RecordNotUnique, with: :handle_record_not_unique
    rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing
    rescue_from ArgumentError, with: :handle_argument_error
    rescue_from StandardError, with: :handle_standard_error
  end

  private

  def handle_not_found(exception)
    render json: {
      success: false,
      error: 'Resource not found',
      message: exception.message,
      request_id: request_id
    }, status: :not_found
  end

  def handle_record_invalid(exception)
    render json: {
      success: false,
      error: 'Validation failed',
      message: exception.message,
      details: exception.record.errors.full_messages,
      request_id: request_id
    }, status: :unprocessable_entity
  end

  def handle_record_not_unique(exception)
    render json: {
      success: false,
      error: 'Record already exists',
      message: exception.message,
      request_id: request_id
    }, status: :conflict
  end

  def handle_parameter_missing(exception)
    render json: {
      success: false,
      error: 'Required parameter missing',
      message: exception.message,
      request_id: request_id
    }, status: :bad_request
  end

  def handle_argument_error(exception)
    render json: {
      success: false,
      error: 'Invalid argument',
      message: exception.message,
      request_id: request_id
    }, status: :bad_request
  end

  def handle_standard_error(exception)
    Rails.logger.error "[ErrorHandler] #{exception.class.name}: #{exception.message}"
    Rails.logger.error "[ErrorHandler] Backtrace: #{exception.backtrace.first(10).join("\n")}" if Rails.env.development?

    render json: {
      success: false,
      error: 'Internal server error',
      message: Rails.env.production? ? 'An unexpected error occurred' : exception.message,
      request_id: request_id
    }, status: :internal_server_error
  end

  def request_id
    request.headers['X-Request-ID'] || SecureRandom.uuid
  end
end

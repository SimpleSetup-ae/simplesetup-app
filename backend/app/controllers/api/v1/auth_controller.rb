class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:clerk_webhook]
  
  def verify
    render json: {
      success: true,
      user: UserSerializer.new(current_user).as_json
    }
  end
  
  def clerk_webhook
    # Verify webhook signature
    signature = request.headers['svix-signature']
    timestamp = request.headers['svix-timestamp']
    webhook_id = request.headers['svix-id']
    
    begin
      ClerkService.verify_webhook(request.raw_post, signature, timestamp, webhook_id)
      
      event_type = params['type']
      user_data = params['data']
      
      case event_type
      when 'user.created', 'user.updated'
        handle_user_upsert(user_data)
      when 'user.deleted'
        handle_user_deletion(user_data)
      when 'session.created'
        handle_session_created(user_data)
      end
      
      render json: { success: true }
    rescue => e
      Rails.logger.error "Clerk webhook error: #{e.message}"
      render json: { error: 'Webhook verification failed' }, status: :unauthorized
    end
  end
  
  private
  
  def handle_user_upsert(user_data)
    user = User.find_or_initialize_by(clerk_id: user_data['id'])
    user.update!(
      email: user_data.dig('email_addresses', 0, 'email_address'),
      first_name: user_data['first_name'],
      last_name: user_data['last_name']
    )
    
    # Transfer pre-signup session data if exists
    if session[:pre_signup_data] && user.persisted?
      CompanyFormationService.transfer_session_data(user, session[:pre_signup_data])
      session.delete(:pre_signup_data)
    end
  end
  
  def handle_user_deletion(user_data)
    user = User.find_by(clerk_id: user_data['id'])
    user&.destroy
  end
  
  def handle_session_created(session_data)
    # Handle session creation logic if needed
    Rails.logger.info "Session created for user: #{session_data['user_id']}"
  end
end

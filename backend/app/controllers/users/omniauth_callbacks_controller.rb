class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    handle_auth('Google')
  end

  def linkedin
    handle_auth('LinkedIn')
  end

  def failure
    render json: {
      status: {
        code: 422,
        message: 'Authentication failed.',
        errors: [params[:message]]
      }
    }, status: :unprocessable_entity
  end

  private

  def handle_auth(kind)
    @user = User.from_omniauth(request.env['omniauth.auth'])

    if @user.persisted?
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: kind) if is_navigational_format?
      
      render json: {
        status: {
          code: 200,
          message: "Successfully authenticated with #{kind}.",
          data: {
            user: UserSerializer.new(@user).as_json,
            session_timeout: 24.hours.from_now
          }
        }
      }, status: :ok
    else
      session["devise.#{request.env['omniauth.auth'].provider}_data"] = request.env['omniauth.auth'].except('extra')
      render json: {
        status: {
          code: 422,
          message: 'Authentication failed.',
          errors: @user.errors.full_messages
        }
      }, status: :unprocessable_entity
    end
  end
end

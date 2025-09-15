class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  
  private

  def respond_with(current_user, _opts = {})
    if resource.persisted?
      render json: {
        status: {
          code: 200,
          message: 'Signed up successfully.',
          data: {
            user: UserSerializer.new(current_user).as_json
          }
        }
      }, status: :ok
    else
      render json: {
        status: {
          code: 422,
          message: "User couldn't be created successfully.",
          errors: resource.errors.full_messages
        }
      }, status: :unprocessable_entity
    end
  end
end

class Api::V1::Auth::RegistrationsController < DeviseTokenAuth::RegistrationsController
  include ActionController::Cookies

  private

  def render_create_success
    render json: UserSerializer.new(@resource).serializable_hash
  end

  def sign_up_params
    params.permit(:email, :password, :username)
  end
end


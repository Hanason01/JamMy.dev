class Api::V1::Auth::ConfirmationsController < DeviseTokenAuth::ConfirmationsController
  include DeviseTokenAuth::Concerns::SetUserByToken

  # https://github.com/lynndylanhurley/devise_token_auth/blob/master/app/controllers/devise_token_auth/confirmations_controller.rb デフォルトの挙動はリダイレクトベースでトークンをURLに埋め込む形である為、オーバーライド。

  def show
    @resource = resource_class.confirm_by_token(resource_params[:confirmation_token])

    if @resource.errors.empty?
      token = @resource.create_token
      @resource.save

      auth_header = @resource.create_new_auth_token(token.client)
      response.headers.merge!(auth_header)

      cookies[DeviseTokenAuth.cookie_name] = {
        value: auth_header.to_json,
        **DeviseTokenAuth.cookie_attributes
    }

      render json: {
        success: true,
        message: "アカウントが有効化されました。",
        user: UserSerializer.new(@resource).serializable_hash[:data]
      }, status: :ok

    elsif @resource.confirmed?
      render json: {
        success: true,
        message: "すでにアカウントは有効化されています。",
        user: UserSerializer.new(@resource).serializable_hash[:data]
      }, status: :ok

    else
      render json: {
        success: false,
        message: "認証トークンが無効です。再度お試しください。",
        errors: @resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
end
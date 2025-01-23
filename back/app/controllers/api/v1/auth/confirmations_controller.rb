class Api::V1::Auth::ConfirmationsController < DeviseTokenAuth::ConfirmationsController
  include DeviseTokenAuth::Concerns::SetUserByToken
  def show
    # トークンによる認証
    @resource = resource_class.confirm_by_token(resource_params[:confirmation_token])

    if @resource.errors.empty?
      # トークンの発行と保存
      token = @resource.create_token
      @resource.save

      # トークンヘッダーを生成
      auth_header = @resource.create_new_auth_token(token.client)

      # トークンをレスポンスヘッダーに設定
      response.headers.merge!(auth_header)

        # クッキーにトークンを保存（devise_token_auth.rbに準拠）
      cookies[DeviseTokenAuth.cookie_name] = {
        value: auth_header.to_json,
        **DeviseTokenAuth.cookie_attributes.slice(:domain, :secure, :httponly, :same_site, :expires)
    }

      # 認証成功時
      render json: {
        success: true,
        message: "アカウントが有効化されました。",
        user: UserSerializer.new(@resource).serializable_hash[:data][:attributes]
      }, status: :ok
    elsif @resource.confirmed?
      # すでに認証済みの場合
      render json: {
        success: true,
        message: "すでにアカウントは有効化されています。",
        user: UserSerializer.new(@resource).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      # 認証失敗時
      render json: {
        success: false,
        message: "認証トークンが無効です。再度お試しください。",
        errors: @resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
end
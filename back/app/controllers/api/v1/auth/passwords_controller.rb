class Api::V1::Auth::PasswordsController < DeviseTokenAuth::PasswordsController

  #下記devise_token_authをオーバーライドするもの（フロントをNext.jsとしている状況に対応）
  # https://github.com/lynndylanhurley/devise_token_auth/blob/master/app/controllers/devise_token_auth/passwords_controller.rb
  def edit
    #リセットトークンからユーザー(@resource)を特定
    @resource = resource_class.with_reset_password_token(resource_params[:reset_password_token])

    #リセットトークンの有効性検証
    if @resource && @resource.reset_password_period_valid?
      token = @resource.create_token unless require_client_password_reset_token?

      # アカウント認証スキップ
      @resource.skip_confirmation! if confirmable_enabled? && !@resource.confirmed_at
      # 一時的にパスワード変更を許可
      @resource.allow_password_change = true if recoverable_enabled?
      @resource.save!

      yield @resource if block_given?

      # require_client_password_reset_tokenがtrue（リセットトークンクライアント管理）であれば認証なしで進める
      if require_client_password_reset_token?
        render json: {
          success: true,
          message: 'リセットトークンが有効です',
          reset_password_token: resource_params[:reset_password_token]
        }, status: :ok
      # require_client_password_reset_tokenがfalseであれば認証状態を付与する
      else
        # クッキーセット
        if DeviseTokenAuth.cookie_enabled
          set_token_in_cookie(@resource, token)
        end

        # 認証トークンをヘッダーにセット
        response.headers.merge!(@resource.create_new_auth_token(token.client))

        # 成功をJSONで返す
        render json: {
          success: true,
          message: 'リセットトークンが有効で、認証状態が設定されました'
        }, status: :ok
      end
    else
      render_edit_error
    end
  end

  def update
    # require_client_password_reset_tokenがtrueの場合は認証状態の付与準備
    if require_client_password_reset_token? && resource_params[:reset_password_token]
      @resource = resource_class.with_reset_password_token(resource_params[:reset_password_token])
      return render_update_error_unauthorized unless @resource

      @token = @resource.create_token
    # require_client_password_reset_tokenがfalseの場合は認証状態を継続
    else
      @resource = set_user_by_token
    end

    return render_update_error_unauthorized unless @resource

    # OAuthユーザーではないか検証
    unless @resource.provider == 'email'
      return render_update_error_password_not_required
    end

    # パスワードとパスワード確認のpramsが送られてきているか検証
    unless password_resource_params[:password] && password_resource_params[:password_confirmation]
      return render_update_error_missing_password
    end

    # パスワード変更処理および変更許可→不許可
    if @resource.send(resource_update_method, password_resource_params)
      @resource.allow_password_change = false if recoverable_enabled?
      @resource.save!

      yield @resource if block_given?
      # 認証トークンをクッキーとヘッダーにセット
      if DeviseTokenAuth.cookie_enabled
        set_token_in_cookie(@resource, @token)
      end
      response.headers.merge!(@resource.create_new_auth_token(@token.client))
      return render_update_success
    else
      return render_update_error
    end
  end

  protected

  def render_update_success
    render json: {
      success: true,
      data: UserSerializer.new(@resource).serializable_hash[:data],
      message: I18n.t('devise_token_auth.passwords.successfully_updated')
    }
  end
end


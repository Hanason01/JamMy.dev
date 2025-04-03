class Api::V1::Auth::PasswordsController < DeviseTokenAuth::PasswordsController

  #下記devise_token_authをオーバーライドするもの（フロントをNext.jsとしている状況に対応）
  # https://github.com/lynndylanhurley/devise_token_auth/blob/master/app/controllers/devise_token_auth/passwords_controller.rb
  def edit
    @resource = resource_class.with_reset_password_token(resource_params[:reset_password_token])

    if @resource && @resource.reset_password_period_valid?
      token = @resource.create_token unless require_client_password_reset_token?

      @resource.skip_confirmation! if confirmable_enabled? && !@resource.confirmed_at
      @resource.allow_password_change = true if recoverable_enabled?
      @resource.save!

      yield @resource if block_given?

      if require_client_password_reset_token?
        render json: {
          success: true,
          message: 'リセットトークンが有効です',
          reset_password_token: resource_params[:reset_password_token]
        }, status: :ok
      # require_client_password_reset_tokenは設定ファイルで常にtrueにしているので、実質以下の処理は不要であるが、あくまでデフォルトのロジックを大幅に崩さないようにする事を優先する。
      else
        if DeviseTokenAuth.cookie_enabled
          set_token_in_cookie(@resource, token)
        end
        response.headers.merge!(@resource.create_new_auth_token(token.client))

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
    if require_client_password_reset_token? && resource_params[:reset_password_token]
      @resource = resource_class.with_reset_password_token(resource_params[:reset_password_token])
      return render_update_error_unauthorized unless @resource

      @token = @resource.create_token
    else
      @resource = set_user_by_token
    end

    return render_update_error_unauthorized unless @resource

    unless @resource.provider == 'email'
      return render_update_error_password_not_required
    end

    unless password_resource_params[:password] && password_resource_params[:password_confirmation]
      return render_update_error_missing_password
    end

    if @resource.send(resource_update_method, password_resource_params)
      @resource.allow_password_change = false if recoverable_enabled?
      @resource.save!

      yield @resource if block_given?

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


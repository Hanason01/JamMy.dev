class Api::V1::Auth::OmniauthCallbacksController < DeviseTokenAuth::OmniauthCallbacksController

  # Resource（Userオブジェクト）返却を行わない。リダイレクトのホワイトリストを定義する必要があり、以下をオーバーライド
  # https://github.com/lynndylanhurley/devise_token_auth/blob/master/app/controllers/devise_token_auth/omniauth_callbacks_controller.rb

  def omniauth_success
    get_resource_from_auth_hash
    set_token_on_resource
    create_auth_params

    if confirmable_enabled?
      @resource.skip_confirmation!
    end

    sign_in(:user, @resource, store: false, bypass: false)

    @resource.save!

    yield @resource if block_given?

    if DeviseTokenAuth.cookie_enabled
      set_token_in_cookie(@resource, @token)
    end

    # デフォルト挙動ではクエリパラメータにUserデータが入る為、URL制限を超える可能性→遷移先のフロントでUser情報のみリクエスト
    render_data_or_redirect('deliverCredentials', @auth_params.as_json)
  end

  protected

  def render_data_or_redirect(message, data, user_data = {})
    # 許可するホストやURLのホワイトリストを定義
    allowed_hosts = ["www.jam-my.com", "jam-my.com", "localhost", "127.0.0.1"]
    allowed_paths = ["/auth/google_callback"]

    if ['inAppBrowser', 'newWindow'].include?(omniauth_window_type)
      render_data(message, user_data.merge(data))

    elsif auth_origin_url
      # URLをパースしてホストとパスを取得
      uri = URI.parse(auth_origin_url)
      # ホワイトリスト検証: ホストとパスが一致する場合のみリダイレクトを許可
      if allowed_hosts.include?(uri.host) && allowed_paths.any? { |path| uri.path.start_with?(path) }
        redirect_to DeviseTokenAuth::Url.generate(auth_origin_url, data.merge(blank: true).merge(redirect_options)), allow_other_host: true
      else
        fallback_render "不正なリダイレクト先です: #{auth_origin_url}"
      end
    else
      fallback_render data[:error] || 'An error occurred'
    end
  end
end

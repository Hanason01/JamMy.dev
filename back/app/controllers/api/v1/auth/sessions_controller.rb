class Api::V1::Auth::SessionsController < DeviseTokenAuth::SessionsController
  include ActionController::Cookies

  private

  # Serializerで制御
  def render_create_success
    render json: UserSerializer.new(@resource).serializable_hash
  end

  # DeviseTokenAuth:ApplicationControllerがincludeするconcerns/set_user_by_token.rbのset_cookieメソッドをオーバーライド
  def set_cookie(auth_header)
    # Cookieの有効期限カスタム設定
    expires_in = params[:remember_me] ? 2.weeks.from_now : 1.day.from_now
    # カスタム設定をデフォルト設定にmergeでオーバーライド
    cookies[DeviseTokenAuth.cookie_name] = DeviseTokenAuth.cookie_attributes.merge({
      value: auth_header.to_json,
      expires: expires_in
    })
  end
end
class Api::V1::Auth::TokenValidationsController < DeviseTokenAuth::TokenValidationsController

# レスポンスのUserオブジェクトをUserシリアライザーに準拠させる為、以下をオーバーライド
# https://github.com/lynndylanhurley/devise_token_auth/blob/master/app/controllers/devise_token_auth/token_validations_controller.rb

protected
  def render_validate_token_success
    user_data = UserSerializer.new(@resource).serializable_hash
    render json: {
      success: true,
      data: user_data
    }
  end
end

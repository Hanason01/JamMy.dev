class Api::V1::Users::UserProfilesController < ApplicationController
  def show
    @user = User.find(params[:id])
    render json: user_response(@user)
  end

  private

  def user_response(user)
    UserSerializer.new(user).serializable_hash.merge(
      avatar_url: user.avatar_url
    )
  end
end

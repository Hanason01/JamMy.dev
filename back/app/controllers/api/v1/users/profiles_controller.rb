class Api::V1::Users::ProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:update]

  def show
    render json: user_response(current_user)
  end

  def update
    unless @user
      render json: { error: "権限がありません" }, status: :forbidden
    end

    ActiveRecord::Base.transaction do
      if @user.update!(user_params.except(:avatar))
        if params[:user][:avatar].present? && @user.avatar_url.present?
          delete_file_from_s3(@user.avatar_url)
        end

        if params[:user][:avatar].present?
          avatar_url = upload_file_to_s3(params[:user][:avatar], "avatar")
          @user.update!(avatar_url: avatar_url)
        end

        render json: user_response(@user), status: :ok
      else
        raise ActiveRecord::Rollback, @user.errors.full_messages.join(", ")
      end
    end
  rescue ActiveRecord::Rollback => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def set_user
    @user = current_user
  end

  def user_params
    params.require(:user).permit(:nickname, :bio, :avatar)
  end

  def user_response(user)
    UserSerializer.new(user).serializable_hash.merge(
      avatar_url: user.avatar_url
    )
  end
end
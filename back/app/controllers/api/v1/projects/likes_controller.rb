class Api::V1::Projects::LikesController < ApplicationController
  before_action :authenticate_user!, only: [:create,:destroy]
  before_action :set_project
  before_action :set_like, only: [:destroy]
  def create
    like = @project.likes.new(user: current_user)

    if like.save
      render json: { message: "いいねしました", like: like.as_json(only: [:id]) }, status: :created
    else
      render json: { errors: like.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @like.destroy
      render json: { message: "いいねを削除しました", like: { id: nil } }, status: :ok
    else
      render json: { message: "指定されたプロジェクトのいいねが見つかりません" }, status: :not_found
    end
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def set_like
    @like = @project.likes.find_by(user: current_user)
    unless @like
      render json: { message: "いいねが見つからないか、解除する権限がありません" }, status: :not_found
    end
  end
end

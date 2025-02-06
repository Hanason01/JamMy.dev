class Api::V1::Projects::BookmarksController < ApplicationController
  before_action :authenticate_user!, only: [:create,:destroy]
  before_action :set_project
  before_action :set_bookmark, only: [:destroy]
  def create
    bookmark = @project.bookmarks.new(user: current_user)

    if bookmark.save
      render json: { message: "ブックマークしました", bookmark: bookmark.as_json(only: [:id]) }, status: :created
    else
      render json: { errors: bookmark.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @bookmark.destroy
      render json: { message: "ブックマークを削除しました", bookmark: { id: nil } }, status: :ok
    else
      render json: { message: "指定されたプロジェクトのブックマークが見つかりません" }, status: :not_found
    end
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def set_bookmark
    @bookmark = @project.bookmarks.find_by(user: current_user)
    unless @bookmark
      render json: { message: "ブックマークが見つからないか、解除する権限がありません" }, status: :not_found
    end
  end
end

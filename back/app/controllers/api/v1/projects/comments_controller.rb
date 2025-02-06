class Api::V1::Projects::CommentsController < ApplicationController
  before_action :set_project

  def index
    begin
    comments = @project.comments.where(ancestry: nil) #projectに対するコメント
                        .includes(:user)
                        .order(created_at: :desc)
                        .page(params[:page])
                        .per(10)  # 設定オーバーライド

    if comments.any?
      serialized = serialized_comments(comments)

      render json: {
        data: serialized[:data],
        included: serialized[:included],
        meta: { total_pages: comments.total_pages }
      }
    else
      render json: { data: [], included: [], meta: { total_pages: 0 } }, status: :ok
    end
    rescue => e
      Rails.logger.error "エラー発生: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: e.message }, status: 500
    end
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def serialized_comments(comments)
    CommentSerializer.new(
      comments,
      include: [:user]
    ).serializable_hash
  end
end

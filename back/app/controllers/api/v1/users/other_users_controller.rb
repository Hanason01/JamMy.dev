class Api::V1::Users::OtherUsersController < ApplicationController

  def index
    unless params[:user_id].present? && params[:filter].present?
      return render json: { error: "不正なパラメーターです" }, status: :bad_request
    end

    projects =
      case params[:filter]
      when "user_projects"
        Project.includes(:user, :audio_file, :likes, :bookmarks)
              .where(user_id: params[:user_id])
              .where(status: [:open, :closed])
              .where(visibility: :is_public)
      when "user_collaborated"
        Project.includes(:user, :audio_file, :likes, :bookmarks)
              .joins(:collaborations)
              .where(collaborations: { user_id: params[:user_id], status: "approved" })
              .distinct
      else
        return render json: { error: "不正なパラメーターです" }, status: :bad_request
      end

    projects = projects.order(created_at: :desc).page(params[:page])

    if projects.any?
      user_likes = user_likes_map
      user_bookmarks = user_bookmarks_map
      project_likes = project_likes_map
      project_comments = project_comments_map

      serialized = serialized_projects(projects, user_likes, project_likes, user_bookmarks, project_comments)

      render json: {
        data: serialized[:data],
        included: serialized[:included],
        meta: { total_pages: projects.total_pages }
      }
    else
      render json: { data: [], included: [], meta: { total_pages: 0 } }, status: :ok
    end
  end

  private

  def user_likes_map
    return {} unless current_user
    current_user.likes.where(likeable_type: "Project").pluck(:likeable_id, :id).to_h
  end

  def user_bookmarks_map
    return {} unless current_user
    current_user.bookmarks.pluck(:project_id, :id).to_h
  end

  def project_likes_map
    Like.where(likeable_type: "Project").group(:likeable_id).count
  end

  def project_comments_map
    Comment.where(commentable_type: "Project").group(:commentable_id).count
  end
end

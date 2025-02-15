class Api::V1::Users::ProjectsController < ApplicationController
  before_action :authenticate_user!, only: [:index]

  def index
    unless params[:filter]
      return render json: { error: "不正なパラメーターです" }, status: :bad_request

    end
    Rails.logger.debug "渡されてきたフィルターやで！！！！！！！！！！: #{params[:filter].inspect}"
    projects =
      case params[:filter]
      when "my_projects"
        current_user.projects.includes(:user, :audio_file, :likes, :bookmarks)
      when "collaborating"
        Project.includes(:user, :audio_file, :likes, :bookmarks)
              .joins(:collaborations)
              .where(collaborations: { user_id: current_user.id, status: "pending" })
              .distinct
      when "collaborated"
        Project.includes(:user, :audio_file, :likes, :bookmarks)
              .joins(:collaborations)
              .where(collaborations: { user_id: current_user.id, status: "approved" })
              .distinct
      when "bookmarks"
        Project.includes(:user, :audio_file, :likes, :bookmarks)
              .where(id: current_user.bookmarks.select(:project_id))
      else
        return render json: { error: "不正なパラメーターです" }, status: :bad_request
      end

    projects = projects.order(created_at: :DESC).page(params[:page])

    if projects.any?
      user_likes = user_likes_map
      user_bookmarks = user_bookmarks_map
      project_likes = project_likes_map
      project_comments = project_comments_map
      serialized = serialized_projects(projects, user_likes, user_bookmarks, project_likes, project_comments)

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

end

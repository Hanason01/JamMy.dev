class Api::V1::ProjectsController < ApplicationController
  def index
    projects = Project.includes(:user)
                      .where(status: ["open", "close"] )
                      .where(visibility: "is_public")
                      .order(created_at: :desc)

    # if user_signed_in?
    #   projects = projects.includes(:likes, :comments, :bookmarks)
    # end
    render json: ProjectSerializer.new(projects, { include: [:user] }).serializable_hash
  end
end

class Api::V1::CollaborationsController < ApplicationController
  before_action :authenticate_user!
  # def new
  #   project = Project.find(params[:project_id])
  #   render json: ProjectSerializer.new(project, { include: [:user] }).serializable_hash
  # end
end

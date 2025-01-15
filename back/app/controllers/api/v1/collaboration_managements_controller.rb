class Api::V1::CollaborationManagementsController < ApplicationController
  before_action :authenticate_user!, only: [:index]

  def index
    project = Project.find(params[:project_id])
    collaborations = project.collaborations.includes(:user, :audio_file)
    .where(status: :pending )
    .order(created_at: :asc)
    if collaborations.any?
      render json: CollaborationManagementSerializer.new(collaborations, { include: [:user, :audio_file] }).serializable_hash
    else
      render json: { data: []}, status: :ok
    end
  end
end

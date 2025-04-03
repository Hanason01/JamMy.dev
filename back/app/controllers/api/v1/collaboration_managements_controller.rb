class Api::V1::CollaborationManagementsController < ApplicationController
  before_action :authenticate_user!, only: [:index, :update]

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

  def update
    ActiveRecord::Base.transaction do
      unless params[:project][:audio_file].present?
        raise ActiveRecord::Rollback, "音声ファイルが必要です"
      end

      project = Project.find(params[:project][:project_id])

      if terminate_mode?(params[:project])
        terminate_project(project)
      end


      update_collaborations(params[:project][:collaboration_ids], project) if params[:project][:collaboration_ids].present?

      save_audio_file(project, params[:project][:audio_file])

      render json: { message: "Project and audio file updated successfully" }, status: :ok
    end
  rescue ActiveRecord::Rollback => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def update_collaborations(collaboration_ids, project)
    collaborations = Collaboration.where(id: collaboration_ids, project_id: project.id)

    collaborations.each do |collaboration|
      unless collaboration.update(status: :approved)
        raise ActiveRecord::Rollback, "Collaboration ID #{collaboration.id} のステータス更新に失敗しました: #{collaboration.errors.full_messages.join(', ')}"
      end

      Notification.create!(
      recipient: collaboration.user,
      sender: project.user,
      notifiable: collaboration,
      notification_type: :collaboration_approved
    )
    end
  end

  def terminate_mode?(project_params)
    project_params[:mode].present? && project_params[:mode] == "terminate"
  end
end

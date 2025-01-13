class Api::V1::CollaborationsController < ApplicationController
  before_action :authenticate_user!

  def create
    ActiveRecord::Base.transaction do
      #プロジェクト作成
      collaboration = current_user.collaborations.build(collaboration_params.except(:audio_file))
      collaboration.project_id = params[:project_id]
      unless collaboration.save
        raise ActiveRecord::Rollback, collaboration.errors.full_messages.join(", ")
      end

      unless params[:collaboration][:audio_file].present?
        raise ActiveRecord::Rollback, "音声ファイルが必要です"
      end

        #ファイル保存
      audio_file = collaboration.build_audio_file(
        file_path: upload_audio_file_to_s3(params[:collaboration][:audio_file])
      )
      unless audio_file.save
        raise ActiveRecord::Rollback, audio_file.errors.full_messages.join(", ")
      end

      #全て成功時のレスポンス
      render json: { message: "Collaboration and audio file created successfully" }, status: :created
    end
  rescue ActiveRecord::Rollback => e
    #ロールバック時のレスポンス
    render json: { error: e.message }, status: :unprocessable_entity
  end

private

  def collaboration_params
    params.require(:collaboration).permit(:comment, :audio_file)
  end
end
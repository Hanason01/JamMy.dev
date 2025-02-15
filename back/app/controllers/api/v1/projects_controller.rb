class Api::V1::ProjectsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :edit, :update, :destroy]
  def index
    projects = Project.includes(:user, :audio_file, :likes, :bookmarks)
                      .where(status: [:open, :closed] )
                      .where(visibility: :is_public)
                      .order(created_at: :desc)
                      .page(params[:page])
    if projects.any?
      #Serializerでcurrent_userは使用できない為、paramsで受け渡し
      #認証されている場合はuserオブジェクトが、未認証の場合はnilを返す
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
      render json: { data: [], included: [], meta: { total_pages: 0 }}, status: :ok
    end
  end

  def show
    projects = Project.includes(:user, :audio_file, :likes, :bookmarks)
                    .where(id: params[:id], status: [:open, :closed])

    if projects.any?
      user_likes = user_likes_map
      user_bookmarks = user_bookmarks_map
      project_likes = project_likes_map
      project_comments = project_comments_map

      serialized = serialized_projects(projects, user_likes, user_bookmarks, project_likes, project_comments)

      render json: {
        data: serialized[:data],
        included: serialized[:included],
      }
    else
      render json: { data: [] }, status: :ok
    end
  end

  def create
    ActiveRecord::Base.transaction do
      #プロジェクト作成
      project = current_user.projects.build(project_params.except(:audio_file))
      unless project.save
        raise ActiveRecord::Rollback, project.errors.full_messages.join(", ")
      end

      unless params[:project][:audio_file].present?
        raise ActiveRecord::Rollback, "音声ファイルが必要です"
      end

        #ファイル保存
      audio_file = project.build_audio_file(
        file_path: upload_file_to_s3(params[:project][:audio_file], "audio_files")
      )
      unless audio_file.save
        raise ActiveRecord::Rollback, audio_file.errors.full_messages.join(", ")
      end

      #全て成功時のレスポンス
      render json: { message: "Project and audio file created successfully" }, status: :created
    end
  rescue ActiveRecord::Rollback => e
    #ロールバック時のレスポンス
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def update
    ActiveRecord::Base.transaction do
      #プロジェクト作成
      project = Project.find(params[:id])

      # プロジェクト終了しない場合
      if (params[:project][:status] == "null")
        project.assign_attributes(project_params.except(:audio_file, :duration, :tempo, :status))
        project.save!
      # プロジェクト終了する場合
      elsif (params[:project][:status] == "closed")
        if (params[:project][:audio_file] == "null")
          raise ActiveRecord::Rollback, "音声ファイルが必要です"
        end
        project.assign_attributes(project_params.except(:audio_file, :duration, :tempo, :status))
        #Projectを終了・コラボレーション処理
        terminate_project(project)
        # ProjectのAudioFile の削除・保存（S3処理含む）
        save_audio_file(project, params[:project][:audio_file])
      end

      #全て成功時のレスポンス
      render json: { message: "Project and audio file updated successfully" }, status: :created
    end
  rescue ActiveRecord::Rollback => e
    #ロールバック時のレスポンス
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def destroy
    ActiveRecord::Base.transaction do
      project = Project.find(params[:id])

      # 権限二重チェック
      unless project.user == current_user
        raise ActiveRecord::Rollback, "このプロジェクトを削除する権限がありません"
      end

      # projectの音声ファイル削除
      if project.audio_file.present?
        delete_file_from_s3(project.audio_file.file_path)
      end

      # 関連するcollaborationの音声ファイル削除
      project.collaborations.each do |collaboration|
        if collaboration.audio_file.present?
          delete_file_from_s3(collaboration.audio_file.file_path)
          collaboration.audio_file.destroy!
        end
        collaboration.destroy!
      end

        # プロジェクトの削除
      project.destroy!

      # 成功時のレスポンス
      render json: { message: "プロジェクトが正常に削除されました" }, status: :ok
    end
  rescue ActiveRecord::Rollback => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def project_params
    params.require(:project).permit(:title, :description, :duration, :tempo, :status, :visibility, :audio_file)
  end
end
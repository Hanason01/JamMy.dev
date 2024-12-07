class Api::V1::ProjectsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :destroy]
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
      audio_file = project.audio_files.build(
        user: current_user,
        file_path: upload_audio_file_to_s3(params[:project][:audio_file])
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

  def destroy;end

  private

  def project_params
    params.require(:project).permit(:title, :description, :duration, :tempo, :status, :visibility, :audio_file)
  end

  def upload_audio_file_to_s3(audio_file)
    #S3へアクセスするインスタンスを作成
    s3 = Aws::S3::Resource.new(
      access_key_id: Rails.application.credentials.dig(:aws, :access_key_id),
      secret_access_key: Rails.application.credentials.dig(:aws, :secret_access_key),
      region: 'ap-northeast-1'
    )
    #S3インスタンスにバケット名を紐付け
    bucket = s3.bucket('jam-my')
    #ファイル名の指定。audio/filesという仮想フォルダを含める。original_filenameはaudio_fileのname属性の値を取得する
    file_name = "audio_files/#{SecureRandom.uuid}_#{audio_file.original_filename}"

    #S3へのアップロード処理
    begin
      obj = bucket.object(file_name)
      obj.upload_file(audio_file.path)
    rescue  Aws::S3::Errors::ServiceError => e
      Rails.logger.error "S3アップロードエラー: #{e.message}"
      raise "ファイル保存に失敗しました"
    end

    #S3からアップロード後のURLを取得。
    return obj.public_url
  end
end
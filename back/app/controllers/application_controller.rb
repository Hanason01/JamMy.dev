class ApplicationController < ActionController::API
        include DeviseTokenAuth::Concerns::SetUserByToken
        include ActionController::Cookies
        # include ActionController::RequestForgeryProtection

  # protect_from_forgery with: :exception

  # before_action :set_csrf_cookie

  #S3へファイル保存（Audio）
  def upload_file_to_s3(file, dir)
    # S3へアクセスするインスタンスを作成
    s3 = initialize_s3_resource
    bucket = s3.bucket('jam-my')
    file_name = "#{dir}/#{SecureRandom.uuid}_#{file.original_filename}"

    begin
      obj = bucket.object(file_name)

      # ACLの設定を削除し、バケットポリシーで制御
      obj.upload_file(file.path, content_type: file.content_type)

    rescue Aws::S3::Errors::ServiceError => e
      Rails.logger.error "S3アップロードエラー: #{e.message}"
      raise "ファイル保存に失敗しました"
    end

    # S3からアップロード後のURLを取得
    obj.public_url
  end


  #S3からファイル削除（Audio）
  def delete_file_from_s3(file_path)
    s3 = initialize_s3_resource
    bucket = s3.bucket('jam-my')

    # ファイルの削除
    begin
      obj = bucket.object(file_path)
      obj.delete
    rescue Aws::S3::Errors::ServiceError => e
      Rails.logger.error "S3削除エラー: #{e.message}"
      raise "既存ファイルの削除に失敗しました"
    end
  end

  # プロジェクトを終了状態にする
  def terminate_project(project)
    project.status = :closed
    handle_collaborations(project)
    project.save!
  end

  # 関連するコラボレーションのstatus処理とファイルの削除
  def handle_collaborations(project)
    project.collaborations.each do |collaboration|
      if collaboration.status == "pending"
        collaboration.update!(status: :rejected)
      end

      if collaboration.audio_file.present?
        delete_file_from_s3(collaboration.audio_file.file_path)
        collaboration.audio_file.destroy!
      end
    end
  end

  # AudioFile を保存
  def save_audio_file(project, audio_file_param)
    if project.audio_file.present?
      delete_file_from_s3(project.audio_file.file_path)
      project.audio_file.destroy!
    end

    project.build_audio_file(
      file_path: upload_file_to_s3(audio_file_param, "audio_files")
    ).save!
  end

  private

  # def set_csrf_cookie
  #   cookies["CSRF-TOKEN"] = form_authenticity_token
  # end

  def initialize_s3_resource
    Aws::S3::Resource.new(
      access_key_id: Rails.application.credentials.dig(:aws, :access_key_id),
      secret_access_key: Rails.application.credentials.dig(:aws, :secret_access_key),
      region: 'ap-northeast-1'
    )
  end

  def user_likes_map #current_userが持つlikeの特定
    @user_likes_map ||= if current_user #条件付き代入、メモ化
      current_user.likes.where(likeable_type: "Project").pluck(:likeable_id, :id).to_h #{project_id => like_id, ...}
    else
      {}
    end
  end

  def user_bookmarks_map
    @user_bookmarks_map ||= if current_user
      current_user.bookmarks.pluck(:project_id, :id).to_h
    else
      {}
    end
  end

  def serialized_projects(projects, user_likes, user_bookmarks, project_likes, project_comments)
    ProjectSerializer.new(
      projects,
      {
        include: [:user, :audio_file],
        params: { # Serializerとの通信用データ
          current_user: current_user,
          user_likes_map: user_likes,
          user_bookmarks_map: user_bookmarks,
          project_likes_map: project_likes,
          project_comments_map: project_comments
        }
      }
    ).serializable_hash
  end


  def project_likes_map
    Like.where(likeable_type: "Project")
        .group(:likeable_id)
        .count
  end


  def project_comments_map
    Comment.where(commentable_type: "Project")
          .group(:commentable_id)
          .count
  end
end

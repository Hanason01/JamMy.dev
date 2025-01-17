class ApplicationController < ActionController::API
        include DeviseTokenAuth::Concerns::SetUserByToken
        include ActionController::Cookies


  def upload_audio_file_to_s3(audio_file)
    #S3へアクセスするインスタンスを作成
    s3 = initialize_s3_resource
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

  def delete_audio_file_from_s3(file_path)
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

  private

  def initialize_s3_resource
    Aws::S3::Resource.new(
      access_key_id: Rails.application.credentials.dig(:aws, :access_key_id),
      secret_access_key: Rails.application.credentials.dig(:aws, :secret_access_key),
      region: 'ap-northeast-1'
    )
  end
end

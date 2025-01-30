class ProjectSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description, :duration, :tempo, :status, :visibility, :created_at, :updated_at
  #下記定義の:like_count, :liked_by_current_user、:current_like_idを含む

  belongs_to :user
  has_one :audio_file

  # attributes追加
  # projectが保有するいいね数
  attribute :like_count do |project|
    project.likes.size
  end

  # current_userがいいねしているかどうか（真偽値）
  attribute :liked_by_current_user do |project, params|
    # params[:current_user] がnilの場合はfalseを返す
    params[:user_likes_map]&.key?(project.id) || false
  end

  # current_userがいいねしている場合、そのlike IDを返す
  attribute :current_like_id do |project, params|
    params[:user_likes_map]&.[](project.id)
  end
end

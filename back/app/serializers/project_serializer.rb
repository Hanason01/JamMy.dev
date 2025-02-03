class ProjectSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description, :duration, :tempo, :status, :visibility, :created_at, :updated_at

  belongs_to :user
  has_one :audio_file

  # いいねの追加
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

  # ブックマークの追加属性
  attribute :bookmarked_by_current_user do |project, params|
    params[:user_bookmarks_map]&.key?(project.id) || false
  end

  attribute :current_bookmark_id do |project, params|
    params[:user_bookmarks_map]&.[](project.id)
  end
end

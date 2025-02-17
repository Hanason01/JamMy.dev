class ProjectSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description, :duration, :tempo, :status, :visibility, :created_at, :updated_at

  belongs_to :user
  has_one :audio_file

  #以下、未認証の場合は、各Mapが存在しないが&.によりnilもしくはfalseを指定する
  # 各Mapは次のような形式・・・{project_id => like_id, ...}


  # いいねの追加
    # projectが保有するいいね数
    attribute :like_count do |project, params|
      params[:project_likes_map]&.[](project.id) || 0
    end

    # current_userがいいねしているかどうか（真偽値）
  attribute :liked_by_current_user do |project, params|
    # params[:current_user] がnilの場合はfalseを返す
    params[:user_likes_map]&.key?(project.id) || false
  end

    # current_userがいいねしている場合、そのlike IDを返す
  attribute :current_like_id do |project, params|
    params[:user_likes_map]&.[](project.id) #.[ハッシュの中身そのもの](検索するkey)→該当keyの値 || nil
  end

  # ブックマークの追加属性
  attribute :bookmarked_by_current_user do |project, params|
    params[:user_bookmarks_map]&.key?(project.id) || false
  end

  attribute :current_bookmark_id do |project, params|
    params[:user_bookmarks_map]&.[](project.id)
  end

  #コメント数の追加属性(projectを親としたcomment数のみ)
  attribute :comment_count do |project, params|
    params[:project_comments_map]&.[](project.id) || 0
  end

  #応募コラボのUser情報の追加属性
  attribute :collaborations do |project|
    project.collaborations
          .where(status: "approved")
          .includes(:user)
          .map { |c|
            {
              user_id: c.user.id,
              username: c.user.username,
              nickname: c.user.nickname,
              avatar_url: c.user.avatar_url
            }
          }
          .uniq { |user| user[:user_id] }
  end
end

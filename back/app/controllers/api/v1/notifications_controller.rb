class Api::V1::NotificationsController < ApplicationController
  before_action :authenticate_user!


  def index
    notifications = current_user.received_notifications
                                .includes(:sender, notifiable: [:user, project: :user, commentable: :user])
                                # .includes(:sender, notifiable: [:user, { project: :user }, { commentable: :user }])
                                .order(created_at: :desc)
                                .limit(50)

    #このエンドポイントにアクセスした時点で既読の扱いにする
    unread_notifications = notifications.unread
    unread_notifications.update_all(read: true) if unread_notifications.exists?

    render json: notifications.map { |notification| format_notification(notification) }
  end

  # ログイン状態での初回アプリアクセス時の通知有無の確認の為のエンドポイント
  def has_unread
    has_unread = current_user.received_notifications.unread.exists?
    render json: { has_unread: has_unread }
  end

  private

  def format_notification(notification)
    {
      id: notification.id,
      notification_type: notification.notification_type,
      read: notification.read,
      created_at: notification.created_at,
      recipient: format_user(notification.recipient),
      sender: notification.sender ? format_user(notification.sender) : nil,
      notifiable: format_notifiable(notification),
      message: generate_message(notification)
    }
  end


  def format_user(user)
    return nil unless user
    {
      id: user.id,
      nickname: user.nickname,
      username: user.username,
      avatar_url: user.avatar_url
    }
  end

  def format_notifiable(notification)
    case notification.notifiable
    when Project
      {
        id: notification.notifiable.id,
        project_id: notification.notifiable.id,
        project_title: notification.notifiable.title
      }
    when Comment
      project = find_project_from_comment(notification.notifiable)
      {
        id: notification.notifiable.id,
        project_id: project&.id,
        project_title: project&.title
      }
    when Collaboration
      {
        id: notification.notifiable.id,
        project_id: notification.notifiable.project.id,
        project_title: notification.notifiable.project.title
      }
    else
      { id: notification.notifiable.id }
    end
  end

  def find_project_from_comment(comment)
    return comment.commentable if comment.commentable.is_a?(Project)

    while comment.commentable.is_a?(Comment)
      comment = comment.commentable
    end

    comment.commentable if comment.commentable.is_a?(Project)
  end


  def generate_message(notification)
    sender_name = notification.sender&.nickname || notification.sender&.username || "名無しのユーザー"
    case notification.notification_type
    when "like"
      "#{sender_name} さんがあなたの投稿に「いいね！」しました"
    when "comment"
      "#{sender_name} さんがあなたの投稿にコメントしました"
    when "collaboration_request"
      "#{sender_name} さんがあなたの投稿に応募しました"
    when "collaboration_approved"
      "#{sender_name} さんの投稿への応募が承認されました"
    else
      "新しい通知があります"
    end
  end
end

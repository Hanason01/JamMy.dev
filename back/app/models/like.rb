class Like < ApplicationRecord
  belongs_to :user
  belongs_to :likeable, polymorphic: true
  has_one :notification, as: :notifiable, dependent: :destroy

  validates :user_id, presence: true, uniqueness: {scope: [:likeable_type, :likeable_id], message: "いいねは一度しかできません"}
  validates :likeable_type, presence: true, inclusion: {in: %w[Project Comment]}
  validates :likeable_id, presence: true

  after_create :create_notification

  private

  def create_notification
    return if user == likeable.user

    unless Notification.exists?(
      recipient: likeable.user,
      sender: user,
      notifiable: likeable,
      notification_type: :like
    )
      Notification.create!(
        recipient: likeable.user,
        sender: user,
        notifiable: likeable,
        notification_type: :like
      )
    end
  end
end

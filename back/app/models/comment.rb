class Comment < ApplicationRecord
  has_ancestry counter_cache: true
  belongs_to :user
  belongs_to :commentable, polymorphic: true
  has_one :notification, as: :notifiable, dependent: :destroy

  validates :user_id, presence: true
  validates :commentable_id, presence: true
  validates :commentable_type, presence: true, inclusion: { in: %w[Project Comment]}
  validates :content, presence: true, length: { minimum: 1, maximum: 255 }

  after_create :create_notification

  private

  def create_notification
    return if user == commentable.user

    Notification.create!(
      recipient: commentable.user,
      sender: self.user,
      notifiable: self,
      notification_type: :comment
    )
  end
end

class Notification < ApplicationRecord
  belongs_to :recipient, class_name: "User"
  belongs_to :sender, class_name: "User", optional: true #システム通知にも対応させる為オプショナル有効
  belongs_to :notifiable, polymorphic: true, optional: true

  enum notification_type: {
    like: 0,
    comment: 1,
    collaboration_request: 2,
    collaboration_approved: 3
  }

  validates :notification_type, presence: true, inclusion: { in: notification_types.keys}
  validates :expires_at, presence: true

  scope :unread, -> {where(read: false)}

  before_validation :set_expiration, on: :create
  after_create :publish_unread_flag #通知作成後にブロードキャスト配信

  private

  def set_expiration
    self.expires_at ||= 180.days.from_now
  end

  #下記publishはブロードキャストであり、subscribe側がオフラインであればデータは消失→既存のエンドポイントで対応
  def publish_unread_flag
    key = "user:#{recipient.id}:has_unread"
    #未読がない場合だけ、新たな未読が発生した事を伝える
    unless recipient.received_notifications.unread.exists?
      $redis.publish(key, recipient.id)
    end
  end
end

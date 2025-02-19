class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :omniauthable, omniauth_providers: [:google_oauth2]
  include DeviseTokenAuth::Concerns::User

  has_many :projects, dependent: :destroy
  has_many :collaborations, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :received_notifications, class_name: "Notification", foreign_key: "recipient_id", dependent: :destroy
  has_many :sent_notifications, class_name: "Notification", foreign_key: "sender_id", dependent: :nullify

  validates :username,
          uniqueness: { message: "は既に使用されています" },
          length: { in: 5..15 },
          format: { with: /\A[a-zA-Z0-9._]+\z/, message: "は英数字、アンダースコア(_)、ドット(.)のみが使用できます" },
          allow_nil: true,
          on: :create
  validates :nickname, presence: true, length: { maximum:15 }, on: :create
  validates :bio, length: { maximum: 160 }, on: :create
  validates :provider, presence: true, on: :create
  # validates :avatar_url, format: { with: /\Aavatar\/[a-zA-Z0-9\-_.]+\z/, message: "は正しい形式で指定してください" }, allow_blank: true
end

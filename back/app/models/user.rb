class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  include DeviseTokenAuth::Concerns::User

  has_many :projects, dependent: :destroy
  has_many :collaborations, dependent: :destroy

  validates :username,
          presence: true,
          uniqueness: { message: "は既に使用されています" },
          length: { in: 5..15 },
          format: { with: /\A[a-zA-Z0-9._]+\z/, message: "は英数字、アンダースコア(_)、ドット(.)のみが使用できます" },
          on: :create
  validates :nickname, length: { maximum:15 }, on: :create
  validates :bio, length: { maximum: 160 }, on: :create
  validates :provider, presence: true, on: :create
  # validates :tokens, json: true (JsonValidatorを実装する必要あり)
end

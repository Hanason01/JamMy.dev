class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  include DeviseTokenAuth::Concerns::User

  # validates :username, presence: true, uniqueness: true, length: { in: 5..15 }, format: { with: /\A[a-zA-Z0-9._]+\z/, message: "は英数字、アンダースコア(_)、ドット(.)のみが使用できます" }
  validates :nickname, length: { maximum:15 }
  validates :bio, length: { maximum: 160 }
  validates :provider, presence: true
  # validates :tokens, json: true (JsonValidatorを実装する必要あり)
end
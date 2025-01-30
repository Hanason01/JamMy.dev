class Like < ApplicationRecord
  belongs_to :user
  belongs_to :likeable, polymorphic: true

  validates :user_id, presence: true, uniqueness: {scope: [:likeable_type, :likeable_id], message: "いいねは一度しかできません"}
  validates :likeable_type, presence: true, inclusion: {in: %w[Project Comment]}
  validates :likeable_id, presence: true
end

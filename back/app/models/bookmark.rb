class Bookmark < ApplicationRecord
  belongs_to :user
  belongs_to :project

  validates :user_id, presence: true
  validates :project_id, presence: true
  validates :project_id, uniqueness: { scope: :user_id, message: "ブックマークは一度しかできません" }
end

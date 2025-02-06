class Comment < ApplicationRecord
  has_ancestry counter_cache: true
  belongs_to :user
  belongs_to :commentable, polymorphic: true

  validates :user_id, presence: true
  validates :commentable_id, presence: true
  validates :commentable_type, presence: true, inclusion: { in: %w[Project Comment]}
  validates :content, presence: true, length: { minimum: 1, maximum: 255 }
end

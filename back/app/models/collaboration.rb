class Collaboration < ApplicationRecord
  belongs_to :user
  belongs_to :project
  has_one :audio_file, as: :fileable, dependent: :destroy

  enum status: { pending: 0, approved: 1, rejected: 2}

  validates :comment, length: { maximum: 255 }, allow_nil: true
  # statusの値保証
  validates :status, inclusion: { in: statuses.keys }
end

class Project < ApplicationRecord
  belongs_to :user
  has_one :audio_file, as: :fileable, dependent: :destroy
  has_many :collaborations, dependent: :destroy

  enum status: { open: 0, draft: 1, closed: 2}
  enum visibility: { is_public: 0, is_private: 1 }

  validates :title, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 255 }, allow_nil: true
  validates :duration, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 30 }
  validates :tempo, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 200 }
  # statusの値保証
  validates :status, inclusion: { in: statuses.keys }
  validates :visibility, inclusion: { in: visibilities.keys }
end

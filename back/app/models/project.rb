class Project < ApplicationRecord
  belongs_to :user

  enum status: { draft: 0, oepn: 1, closed: 2}
  enum visibility: { is_public: 0, is_private: 1 }

  validates :title, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 140 }, allow_nil: true
  validates :duration, numericality: { only_integer: true, grater_than_or_equal_to: 1, less_than_or_equal_to: 30 }
  validates :tempo, numericality: { only_integer: true, grater_than_or_equal_to: 1, less_than_or_equal_to: 240 }
  validates :status, inclusion: { in: statuses.keys }
  validates :visibility, inclusion: { in: visibilities.keys }
end

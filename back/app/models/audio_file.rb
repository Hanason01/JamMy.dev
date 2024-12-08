class AudioFile < ApplicationRecord
  belongs_to :fileable, polymorphic: true

  validates :fileable_type, presence: true, inclusion: { in: %w[Project Collaboration] }
  validates :fileable_id, presence: true
  validates :file_path, presence: true, uniqueness: true
end

class AudioFile < ApplicationRecord
  belongs_to :fileable, polymorphic: true
  belongs_to :user

  validates :user_id, :fileable_type, :fileable_id, :file_path, presence: true
end

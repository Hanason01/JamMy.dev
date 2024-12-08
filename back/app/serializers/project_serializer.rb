class ProjectSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description, :duration, :tempo, :status, :visibility, :created_at, :updated_at
  belongs_to :user
  has_one :audio_file
end

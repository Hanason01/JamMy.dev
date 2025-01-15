class CollaborationManagementSerializer
  include JSONAPI::Serializer
  attributes :id, :comment
  belongs_to :user
  belongs_to :project
  has_one :audio_file
end

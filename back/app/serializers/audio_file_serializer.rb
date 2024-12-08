class AudioFileSerializer
  include JSONAPI::Serializer
  attributes :id, :file_path
end

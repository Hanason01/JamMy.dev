class UserSerializer
  include JSONAPI::Serializer
  attributes :id, :username, :nickname, :image, :bio
end
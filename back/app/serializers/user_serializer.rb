class UserSerializer
  include JSONAPI::Serializer
  attributes :id, :email, :username, :nickname, :image, :bio
end
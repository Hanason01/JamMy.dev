class UserSerializer
  include JSONAPI::Serializer
  attributes :id, :email, :username, :nickname, :bio, :avatar_url
end
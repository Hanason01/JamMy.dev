class CommentSerializer
  include JSONAPI::Serializer
  attributes :id, :content, :created_at, :updated_at, :children_count

  belongs_to :user

  # 子コメントに対する返信も当Serializerの対象とする
  # has_many :children, serializer: CommentSerializer
end
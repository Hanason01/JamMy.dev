# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first

require 'faker'

# ユーザーの作成
# users_data = [
#   {
#     email: "allferstyle@yahoo.co.jp",
#     password: "syusei225",
#     username: "username",
#     nickname: "ぷちゃ"
#   },
#   {
#     email: "example@yahoo.co.jp",
#     password: "syusei225",
#     username: "exampleuser",
#     nickname: "ポンチェ"
#   }
# ]

# users = users_data.map do |user_data|
#   User.find_or_create_by!(email: user_data[:email]) do |user|
#     user.password = user_data[:password]
#     user.username = user_data[:username]
#     user.nickname = user_data[:nickname]
#   end
# end

# # 各ユーザーに5つの投稿を作成
# users.each do |user|
#   5.times do
#     Project.create!(
#       user: user,
#       title: Faker::App.name,
#       description: Faker::Lorem.paragraph,
#       duration: rand(1..30),
#       tempo: rand(40..240),
#       status: Project.statuses.keys.sample,
#       visibility: Project.visibilities.keys.sample,
#     )
#   end
# end

# 既存のユーザーとプロジェクトを確認
user = User.find(1)
project = Project.find(20)

# プロジェクトに対する親コメントを20件作成
20.times do |i|
  Comment.create!(
    user: user,
    commentable: project,
    content: "ダミー親コメント #{i + 1}: #{Faker::Lorem.sentence}"
  )
end
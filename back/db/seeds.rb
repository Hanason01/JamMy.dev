# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first

require 'faker'

user = User.first || User.create(email: "samples@example.com", password: "password")

10.times do
  Project.create!(
    user: user,
    title: Faker::App.name,
    description: Faker::Lorem.paragraph,
    duration: rand(1..30),
    tempo: rand(40..240),
    status: Project.statuses.keys.sample,
    visibility: Project.visibilities.keys.sample,
  )
end
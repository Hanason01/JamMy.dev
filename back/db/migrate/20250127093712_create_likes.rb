class CreateLikes < ActiveRecord::Migration[7.0]
  def change
    create_table :likes do |t|
      t.bigint :user_id, null: false
      t.string :likeable_type, null: false
      t.bigint :likeable_id, null: false
      t.timestamps

      t.index [:user_id, :likeable_type, :likeable_id],unique: true
      t.index [:likeable_type, :likeable_id]
    end

    add_foreign_key :likes, :users, column: :user_id
  end
end

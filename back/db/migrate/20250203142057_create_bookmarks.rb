class CreateBookmarks < ActiveRecord::Migration[7.0]
  def change
    create_table :bookmarks do |t|
      t.bigint :user_id, null: false
      t.bigint :project_id, null: false
      t.timestamps

    end
    add_foreign_key :bookmarks, :users, column: :user_id
    add_foreign_key :bookmarks, :projects, column: :project_id
    add_index :bookmarks, [:user_id, :project_id], unique: true
  end
end

class CreateComments < ActiveRecord::Migration[7.0]
  def change
    create_table :comments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :commentable, polymorphic: true, null: false
      t.text :content, null: false
      t.string :ancestry
      t.integer :children_count, default: 0, null: false

      t.timestamps
    end
    add_index :comments, :ancestry
    add_index :comments, :children_count
  end
end

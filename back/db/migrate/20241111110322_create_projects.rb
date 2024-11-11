class CreateProjects < ActiveRecord::Migration[7.0]
  def change
    create_table :projects do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.integer :duration, default: 30, null: false
      t.integer :tempo, default: 120, null: false
      t.integer :status, default: 0, null: false
      t.integer :visibility, default: 0, null: false
      t.timestamps
    end
  end
end

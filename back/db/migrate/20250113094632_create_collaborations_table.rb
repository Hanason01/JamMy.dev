class CreateCollaborationsTable < ActiveRecord::Migration[7.0]
  def change
    create_table :collaborations do |t|
      t.references :project, null: false, foreign_key: true, type: :bigint
      t.references :user, null: false, foreign_key: true, type: :bigint
      t.integer :status, default: 0
      t.text :comment
      t.timestamps
    end
  end
end

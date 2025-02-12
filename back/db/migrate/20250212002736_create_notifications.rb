class CreateNotifications < ActiveRecord::Migration[7.0]
  def change
    create_table :notifications do |t|
      t.references :recipient, null: false, foreign_key: { to_table: :users }
      t.references :sender, foreign_key: { to_table: :users }
      t.references :notifiable, polymorphic: true, null: true
      t.integer :notification_type, null: false, default: 0
      t.boolean :read, default: false, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end
  end
end

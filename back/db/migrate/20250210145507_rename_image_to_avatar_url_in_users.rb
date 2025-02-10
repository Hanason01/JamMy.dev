class RenameImageToAvatarUrlInUsers < ActiveRecord::Migration[7.0]
  def change
    rename_column :users, :image, :avatar_url
  end
end

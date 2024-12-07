class CreateAudioFiles < ActiveRecord::Migration[7.0]
  def change
    create_table :audio_files do |t|
      t.references :user, foreign_key: true, null: false
      t.string :fileable_type, null: false
      t.bigint :fileable_id, null: false
      t.string :file_path, null: false
      t.timestamps
    end

    add_index :audio_files, [:fileable_type, :fileable_id]
  end
end

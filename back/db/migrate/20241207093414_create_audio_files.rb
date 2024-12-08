class CreateAudioFiles < ActiveRecord::Migration[7.0]
  def change
    create_table :audio_files do |t|
      t.string :fileable_type, null: false
      t.bigint :fileable_id, null: false
      t.string :file_path, null: false
      t.timestamps
    end

    add_index :audio_files, [:fileable_type, :fileable_id], unique: true

    # fileable_type に許可される値を制限
    execute <<-SQL
      ALTER TABLE audio_files
      ADD CONSTRAINT check_fileable_type
      CHECK (fileable_type IN ('Project', 'Collaboration'));
    SQL
  end
end

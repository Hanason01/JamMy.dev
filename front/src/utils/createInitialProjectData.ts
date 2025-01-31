import { Project, IncludedItem, InitialProjectData, User, AudioFile } from "@sharedTypes/types";

export function createInitialProjectData(data: Project[], included: IncludedItem[]): InitialProjectData[] {
  const userMap: Record<string, User> = included.reduce<Record<string, User>>((map, item) => {
    if (item.type === "user") {
      map[item.id] = item as User;
    }
    return map;
  }, {});

  const audioMap: Record<string, string> = included.reduce<Record<string, string>>((map, item) => {
    if (item.type === "audio_file") {
      map[item.id] = (item as AudioFile).attributes.file_path;
    }
    return map;
  }, {});

  return data.map((project) => {
    const user = userMap[project.relationships.user.data.id];
    const audioFileId = project.relationships.audio_file?.data?.id;
    const audioFilePath = audioFileId ? audioMap[audioFileId] : undefined;

    return { ...project, user, audioFilePath };
  });
}

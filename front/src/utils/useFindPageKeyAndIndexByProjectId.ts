import { useSWRConfig } from "swr";
import { EnrichedProject, PageKeyResult } from "@sharedTypes/types";

// SWRのキャッシュから特定のプロジェクトIDを持つページキーを探すカスタムフック
export const useFindPageKeyByProjectId = () => {
  const { cache } = useSWRConfig();

  const findPageKeyByProjectId = (projectId: string): PageKeyResult => {
    // マスターキーを基準に巡回
    for (const key of cache.keys()) {
      // マスターキーを指定
      if (typeof key === "string" && key.startsWith("$inf$/api/projects")) {
        // dataを取得
        const pageDataArray = cache.get(key)?.data as { projects?: EnrichedProject[], meta?: any }[];
        // dataの存在チェック。および
        if (Array.isArray(pageDataArray)) {
          for (let pageIndex = 0; pageIndex < pageDataArray.length; pageIndex++) {
            const pageData = pageDataArray[pageIndex];

            if (Array.isArray(pageData.projects)) {
              // projects内に該当するprojectIdがあるか確認し、インデックスを取得
              const index = pageData.projects.findIndex((project) => project.id === projectId);

              if (index !== -1) {
                const project = pageData.projects[index];
                return { mutateKey: key, projectIndex: index, project }; // マスターキーとインデックス、プロジェクトを返す
              }
            }
          }
        }
      }
    }
    throw new Error(`プロジェクトID ${projectId} に対応するキャッシュが見つかりませんでした。`);
  };

  return findPageKeyByProjectId;
};

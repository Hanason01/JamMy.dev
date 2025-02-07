import { useSWRConfig } from "swr";
import { EnrichedProject, PageKeyResult } from "@sharedTypes/types";

// SWRの一覧キャッシュから特定のプロジェクトIDを持つページキーを探すカスタムフック
export const useFindPageKeyByProjectId = () => {
  const { cache } = useSWRConfig();

  const findPageKeyByProjectId = (projectId: string): PageKeyResult | undefined => {
    // キーを基準に巡回
    for (const key of cache.keys()) {
      // ページネーションのキーかどうか確認
      if (typeof key === "string" && key.startsWith("/api/projects?page=")) {
        const pageData = cache.get(key) as { data?: { projects?: EnrichedProject[] } };

        if (pageData && Array.isArray(pageData.data?.projects)) {  //pageDataはprojects直上のdataを指す
          // projects内に該当するprojectIdがあるか確認し、インデックスを取得
          const index = pageData.data.projects.findIndex((project) => project.id === projectId);

          if (index !== -1) {
            const project = pageData.data.projects[index];
            return { mutateKey: key, projectIndex: index, project }; // 見つかったページキーとインデックスを返す
          }
        }
      }
    }
    return undefined;
  };

  return findPageKeyByProjectId;
};

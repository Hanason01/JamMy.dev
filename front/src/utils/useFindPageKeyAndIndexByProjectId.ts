import { useSWRConfig } from "swr";
import { EnrichedProject, PageKeyResult } from "@sharedTypes/types";

//更新対象のカテゴリーとそれに合わせたキャッシュキーを指定
const categoryToPattern: Record<string, RegExp> = {
  projects: /^\/api\/projects\?page=\d+$/,
  my_projects: /^\/api\/projects\/my_projects\?filter=my_projects&page=\d+$/,
  collaborating: /^\/api\/projects\/my_projects\?filter=collaborating&page=\d+$/,
  collaborated: /^\/api\/projects\/my_projects\?filter=collaborated&page=\d+$/,
  bookmarks: /^\/api\/projects\/my_projects\?filter=bookmarks&page=\d+$/,
  user_projects: /^\/api\/projects\/user_projects\?filter=user_projects&page=\d+$/,
  user_collaborated: /^\/api\/projects\/user_collaborated\?filter=user_collaborated&page=\d+$/
};

// SWRの一覧キャッシュから特定のプロジェクトIDを持つページキーを探すカスタムフック
export const useFindPageKeyByProjectId = () => {
  const { cache } = useSWRConfig();

  const findPageKeyByProjectId = (projectId: string, category?: string): PageKeyResult | undefined => {
    if(!category) return undefined;

    const keyPattern = categoryToPattern[category];
    if (!keyPattern) {
      console.error(`無効なカテゴリ: ${category}`);
      return undefined;
    }

    for (const key of cache.keys()) {
      const normalizedKey = key.replace(/^\$inf\$\//, "/"); //マスターキーは除外

      if (typeof key === "string" && keyPattern.test(normalizedKey)) {
        const pageData = cache.get(key) as { data?: { projects?: EnrichedProject[] } };

        if (pageData && Array.isArray(pageData.data?.projects)) {
          const index = pageData.data.projects.findIndex((project) => project.id === projectId);

          if (index !== -1) {
            const project = pageData.data.projects[index];
            return { mutateKey: key, projectIndex: index, project };
          }
        }
      }
    }
    return undefined;
  };

  return findPageKeyByProjectId;
};

"use client";

import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { EnrichedProject, GetKeyType, PageData } from "@sharedTypes/types";
import { getAllProjectsKey, getMyProjectsKey, getOtherUserProjectsKey, getProjectDetailKey, getNotificationsKey } from "@swr/getKeys";

export const useRevalidateSWR = () => {
  const { mutate, cache } = useSWRConfig();

  // **共通関数: SWR の mutate を実行**
  const executeMutate = async (listKey: string, updatedProject: EnrichedProject) => {
    if (!listKey) return;

    const currentData = cache.get(listKey)?.data as PageData[] | undefined;
    if (!currentData) return;

    await mutate(
      listKey,
      (prevData: PageData[] | undefined) => {
        if (!prevData) return undefined;

        return prevData.map((page) => ({
          ...page,
          projects: page.projects.map((p) =>
            p.id === updatedProject.id ? updatedProject : p
          ),
        }));
      },
      { revalidate: true, populateCache: true }
    );
  };

  // **共通関数: プロジェクトの更新用オブジェクトを作成**
  const createMutateObject = async (getKey: GetKeyType, projectId: string) => {
    const listKey = unstable_serialize(getKey);
    if (!listKey) return null;

    const currentData = cache.get(listKey)?.data as PageData[] | undefined;
    if (!currentData) return null;

    let targetProject: EnrichedProject | undefined;
    for (const page of currentData) {
      const foundProject = page.projects.find((p) => p.id === projectId);
      if (foundProject) {
        targetProject = foundProject;
        break;
      }
    }

    if (!targetProject) return null;

    // 値渡しで参照を変更
    const copiedProject: EnrichedProject = structuredClone(targetProject);

    // オブジェクトの一部を変更（SWR に更新を認識させるため）
    copiedProject.attributes.updatedAt = new Date().toISOString();

    return copiedProject;
  };


   // **一覧のキャッシュ更新**
  const updateAllProjects = async (projectId: string) => {
    const copiedProject = await createMutateObject(getAllProjectsKey, projectId);
    if (!copiedProject) return;
    await executeMutate(unstable_serialize(getAllProjectsKey), copiedProject);
  };

  // **マイプロジェクト一覧のキャッシュ更新**
  const updateMyProjects = async (projectId: string) => {
    const filters = ["my_projects", "collaborating", "collaborated", "bookmarks"];

    await Promise.all(
      filters.map(async (filter) => {
        const copiedProject = await createMutateObject(
          (index) => getMyProjectsKey(index, filter),
          projectId
        );
        if (copiedProject) {
          await executeMutate(
            unstable_serialize((index) => getMyProjectsKey(index, filter)),
            copiedProject
          );
        }
      })
    );
  };

    // **タブごとのキャッシュ更新（マイページ）**
  const updateMyProjectsTab = async (tab: "my_projects" | "collaborating" | "collaborated" | "bookmarks", projectId: string) => {
    const listKey = unstable_serialize((index) => getMyProjectsKey(index, tab));
    if (!listKey) return;

    const copiedProject = await createMutateObject((index) => getMyProjectsKey(index, tab), projectId);
    if (!copiedProject) return;

    await executeMutate(listKey, copiedProject);
  };

  // **他ユーザーのプロジェクト一覧のキャッシュを更新**
  const updateOtherUserProjects = async (projectId: string) => {
    const allKeys = Array.from(cache.keys()) as string[];

    const userProjectKeys = allKeys.filter((key) => key.includes("/api/users/") && key.includes("other_users"));

    const userIds = userProjectKeys.map((key) => {
      const match = key.match(/\/api\/users\/(\d+)\/other_users/);
      return match ? match[1] : null;
    }).filter(Boolean) as string[];

    // mutateバッチ更新
    await Promise.all(
      userIds.map(async (userId) => {
        const filters = ["user_projects", "user_collaborated"];
        await Promise.all(
          filters.map(async (filter) => {
            const copiedProject = await createMutateObject(
              (index) => getOtherUserProjectsKey(index, userId, filter),
              projectId
            );
            if (copiedProject) {
              await executeMutate(
                unstable_serialize((index) => getOtherUserProjectsKey(index, userId, filter)),
                copiedProject
              );
            }
          })
        );
      })
    );
  };

  // **タブごとのキャッシュ更新（ユーザーページ）**
  const updateOtherUserTab = async (userId: string, tab: "user_projects" | "user_collaborated", projectId: string) => {
    const listKey = unstable_serialize((index) => getOtherUserProjectsKey(index, userId, tab));
    if (!listKey) return;

    // プロジェクトデータを取得して更新
    const copiedProject = await createMutateObject((index) => getOtherUserProjectsKey(index, userId, tab), projectId);
    if (!copiedProject) return;

    await executeMutate(listKey, copiedProject);
  };

  // **プロジェクト詳細のキャッシュを更新**
  const updateProjectDetail = async (projectId: string) => {
    const detailKey = getProjectDetailKey(projectId);
    if (detailKey){
      await mutate(detailKey, undefined, { revalidate: true });
    }
  };

  // **通知のキャッシュを更新**
  const updateNotifications = async () => {
    const notificationsKey = getNotificationsKey();
    if (notificationsKey){
    await mutate(notificationsKey, undefined, { revalidate: true });
    }
  };

  // **一覧系3種と詳細ページのバッチ更新**
  const batchUpdateAll = async (projectId: string) => {
    await Promise.all([
      updateAllProjects(projectId),
      updateMyProjects(projectId),
      updateOtherUserProjects(projectId),
      updateProjectDetail(projectId),
    ]);
  };

  return {
    updateAllProjects,
    updateMyProjects,
    updateMyProjectsTab,
    updateOtherUserProjects,
    updateOtherUserTab,
    updateProjectDetail,
    updateNotifications,
    batchUpdateAll,
  };
};

import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { EnrichedProject, GetKeyType } from "@sharedTypes/types";

interface ApplyMutateProps {
  projectId: string;
  createApiRequest?: () => Promise<any>;
  destroyApiRequest?: () => Promise<any>;
  isShowMode: boolean;
  actionType: "like" | "unLike" | "bookmark" | "unBookmark" | "comment" | "unComment" | "delete";
  actionValues: Record<string, any>;
  getKey: GetKeyType;
}

interface PageData {
  projects: EnrichedProject[];
  meta?: { total_pages: number; [key: string]: any };
}

export const useApplyMutate = () => {
  const { mutate, cache } = useSWRConfig();

  // **APIリクエストの実行関数**
  const executeApiRequest = async ({
    projectId,
    createApiRequest,
    destroyApiRequest,
  }: {
    projectId: string;
    createApiRequest?: () => Promise<any>;
    destroyApiRequest?: () => Promise<any>;
  }) => {
    if (destroyApiRequest) {
      return await destroyApiRequest();
    } else if (createApiRequest) {
      return await createApiRequest();
    } else {
      throw new Error("APIリクエスト関数が指定されていません");
    }
  };

  // **操作種別に応じた新規オブジェクトを作成する関数**
  const createUpdatedProject = (
    targetProject: EnrichedProject,
    actionType:  "like" | "unLike" | "bookmark" | "unBookmark" | "comment" | "unComment" | "delete",
    actionValues: Record<string, any>
  ): EnrichedProject => {

    //いいねの場合
    if (actionType === "like" || actionType === "unLike") {
      const updatedProject = {
        ...targetProject,
        attributes: {
          ...targetProject.attributes,
          like_count: targetProject.attributes.like_count + actionValues.increment,
          liked_by_current_user: actionValues.by_current_user,
          current_like_id: actionValues.id,
        },
      };
      return updatedProject;

    //ブックマークの場合
    } else if (actionType === "bookmark" || actionType === "unBookmark") {
      const updatedProject = {
        ...targetProject,
        attributes: {
          ...targetProject.attributes,
          bookmarked_by_current_user: actionValues.by_current_user,
          current_bookmark_id: actionValues.id,
        },
      };
      return updatedProject;

    //コメントの場合
    }  else if (actionType === "comment" || actionType === "unComment") {
      const updatedProject = {
        ...targetProject,
        attributes: {
          ...targetProject.attributes,
          comment_count: targetProject.attributes.comment_count + actionValues.increment,
        },
      };
      return updatedProject;
    }
    throw new Error("無効な actionType です");
  };


    // **個別のプロジェクトの詳細ページを更新**
    const updateProjectDetailPage = async (
      projectId: string,
      updatedProject: EnrichedProject | null
    ) => {
      const key = `/api/projects/${projectId}`;

      await mutate(
        key,
        (currentData: PageData | undefined) => {
          if (!currentData) return undefined;

          // **削除処理**
          if (updatedProject === null) {
            return { projects: [] };
          }

          return {
            ...currentData,
            projects: currentData.projects.map((p) =>
              p.id === projectId ? updatedProject : p
            ),
          };
        },
        false
      );
    };


  // **バッチ処理: 一覧の全てのページを更新する(excludeKeyで処理主体は除外)**
  const batchMutateLists = async (
    projectId: string,
    updatedProject: EnrichedProject | null,
    excludeKey: string | null = null
  ) => {

    const allKeys = Array.from(cache.keys()) as string[];

    const keysToUpdate = allKeys.filter((key) => {
      if (key === excludeKey) return false; //一覧かつ処理主体はスキップ
      if (key.includes("/comments")) return false; //コメントはスキップ
      if (key.match(/^\/api\/projects\/\d+$/)) return false; //詳細かつ処理主体はスキップ
      if (key.includes("/notifications")) return false; // 通知はスキップ
      return key.startsWith("$inf$/api/users/") || key.startsWith("$inf$/api/projects?");
    });

    await Promise.all(
      keysToUpdate.map((key) =>
        {
          return mutate(
            key,
            (currentData: PageData[] | undefined) => {
              if (!currentData) return undefined;

              //削除処理専用
              if (updatedProject === null) {
                return currentData.map((page) => ({
                  ...page,
                  projects: page.projects.filter((p) => p.id !== projectId),
                }));
              }

              return currentData.map((page) => ({
                ...page,
                projects: page.projects.map((p) =>
                  p.id === projectId ? updatedProject : p
                ),
              }));
            },
            false
          )
        }
      )
    );
  };

  // **詳細ページのMutate処理**
  const applyMutateForShow = async (props: ApplyMutateProps) => {
    const { projectId, createApiRequest, destroyApiRequest, actionType, actionValues } = props;
    const getKey = props.getKey as () => string | null;
    const mutateKey = getKey();
    let targetProject: EnrichedProject;

    // **1. 楽観的更新 (オプションを活用)**
    await mutate(
      mutateKey,
      async (currentData: PageData | undefined) => {
        if (!currentData) throw new Error("現在のデータが存在しません");

        //APIリクエスト
        const response = await executeApiRequest({projectId, createApiRequest, destroyApiRequest});

        //最終処理
        if (!(actionType === "comment" || actionType === "unComment" || actionType === "delete")){
          actionValues.id = response.id;
        }

        // 削除処理専用
        if (actionType === "delete") {
          batchMutateLists(projectId, null, null);
          return { projects: [] };
        }

        const finalObject = createUpdatedProject(targetProject, actionType, actionValues);

        //一覧ページの更新(除外対象なし)
          batchMutateLists(projectId, finalObject, null);

        // 詳細の更新
        return {
          ...currentData,
          projects: currentData.projects.map((p) =>
            p.id === projectId ? finalObject : p
          ),
        };
      },
      {
        optimisticData: (prevData: PageData | undefined) => {
          if (!prevData) throw new Error("楽観的更新用のデータが存在しません");

          // 削除処理専用
          if (actionType === "delete") {
            return { projects: [] };
          }

          return {
            ...prevData,
            projects: prevData.projects.map((p) =>{
              if (p.id === projectId) {
                targetProject = p; // 対象オブジェクトを特定
                return createUpdatedProject(p, actionType, actionValues);
              }
            return p;
          }),
          };
        },
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };


    // **一覧ページの Mutate 処理**
  const applyMutateForList = async (props: ApplyMutateProps) => {
    const { projectId, createApiRequest, destroyApiRequest, actionType, actionValues, getKey } = props;
    // 一覧ページのキーを取得
    const mutateKey = unstable_serialize(getKey as (index: number) => string);
    let targetProject: EnrichedProject;

    // **1. 楽観的更新**
    await mutate(
      mutateKey,
      async (currentData: PageData[] | undefined) => {
        if (!currentData) throw new Error("現在のデータが存在しません");

        // APIリクエスト
        const response = await executeApiRequest({projectId, createApiRequest, destroyApiRequest});
        if (actionType !== "delete") {
          actionValues.id = response.id;
        }
        //削除処理専用
        if (actionType === "delete") {
          batchMutateLists(projectId, null, mutateKey);
          updateProjectDetailPage(projectId, null)
          return currentData
            .map((page) => ({
              ...page,
              projects: page.projects.filter((p) => p.id !== projectId),
            }))
            .filter((page) => page.projects.length > 0);
        }

        const finalObject = createUpdatedProject(targetProject, actionType, actionValues);

        // 他の一覧ページ更新のバッチ処理(処理主体を除く)
        batchMutateLists(projectId, finalObject, mutateKey);
        // 詳細ページの変更処理（詳細キャッシュがない場合は）
        updateProjectDetailPage(projectId, finalObject)



        // 一覧ページの確定更新
        return currentData.map((page) => ({
          ...page,
          projects: page.projects.map((p) =>
            p.id === projectId ? finalObject : p
          ),
        }));
      },
      {
        optimisticData: (prevData: PageData[] | undefined) => {
          if (!prevData) throw new Error("楽観的更新用のデータが存在しません");

          //削除処理専用
          if (actionType === "delete") {
          return prevData
            .map((page) => ({
              ...page,
              projects: page.projects.filter((p) => p.id !== projectId),
            }))
            .filter((page) => page.projects.length > 0);
        }

          return prevData.map((page) => ({
            ...page,
            projects: page.projects.map((p) => {
              if (p.id === projectId) {
                targetProject = p;
                return createUpdatedProject(p, actionType, actionValues);
              }
              return p;
            }),
          }));
        },
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  //全体処理制御
  const applyMutate = async (props: ApplyMutateProps) => {
    if (props.isShowMode) {
      await applyMutateForShow(props);
    } else {
      await applyMutateForList(props);
    }
  };
  return { applyMutate };
};

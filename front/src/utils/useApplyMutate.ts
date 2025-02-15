import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { EnrichedProject, GetKeyType } from "@sharedTypes/types";

interface ApplyMutateProps {
  projectId: string;
  createApiRequest?: () => Promise<any>;
  destroyApiRequest?: () => Promise<any>;
  isShowMode: boolean;
  actionType: "like" | "unLike" | "bookmark" | "unBookmark" | "comment" | "unComment";
  actionValues: Record<string, any>; // 呼び出し元が指定する動的値の配列
  getKey: GetKeyType; //処理主体のgetKey
}

interface PageData {
  projects: EnrichedProject[];
  meta?: { total_pages: number; [key: string]: any }; //Showの場合はなし
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
    console.log("APIリクエスト開始");
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
    actionType:  "like" | "unLike" | "bookmark" | "unBookmark" | "comment" | "unComment",
    actionValues: Record<string, any>
  ): EnrichedProject => {
    console.log("createUpdatedProject発動", targetProject, actionType, actionValues);

    //いいねの場合
    if (actionType === "like" || actionType === "unLike") {
      console.log("Likeの上書きオブジェクト作成開始");
      const updatedProject = {
        ...targetProject,
        attributes: {
          ...targetProject.attributes,
          like_count: targetProject.attributes.like_count + actionValues.increment,
          liked_by_current_user: actionValues.by_current_user,
          current_like_id: actionValues.id,
        },
      };
      console.log("処理に使用するオブジェクト:", updatedProject);
      return updatedProject;

    //ブックマークの場合
    } else if (actionType === "bookmark" || actionType === "unBookmark") {
      console.log("Bookmarkの上書きオブジェクト作成開始");
      const updatedProject = {
        ...targetProject,
        attributes: {
          ...targetProject.attributes,
          bookmarked_by_current_user: actionValues.by_current_user,
          current_bookmark_id: actionValues.id,
        },
      };
      console.log("処理に使用するオブジェクト", updatedProject);
      return updatedProject;

    //コメントの場合
    }  else if (actionType === "comment" || actionType === "unComment") {
      console.log("Commentの上書きオブジェクト作成開始");
      const updatedProject = {
        ...targetProject,
        attributes: {
          ...targetProject.attributes,
          comment_count: targetProject.attributes.comment_count + actionValues.increment,
        },
      };
      console.log("処理に使用するオブジェクト", updatedProject);
      return updatedProject;
    }
    throw new Error("無効な actionType です");
  };


    // **個別のプロジェクトの詳細ページを更新**
    const updateProjectDetailPage = async (
      projectId: string,
      updatedProject: EnrichedProject
    ) => {
      const key = `/api/projects/${projectId}`;
      console.log(`詳細ページのmutate開始 - key: ${key}`);

      await mutate(
        key,
        (currentData: PageData | undefined) =>
          currentData
            ? {
                ...currentData,
                projects: currentData.projects.map((p) =>
                  p.id === projectId ? updatedProject : p
                ),
              }
            : undefined,
        false
      );
      console.log(`詳細ページのmutate完了 - key: ${key}`);
    };


  // **バッチ処理: 一覧の全てのページを更新する(excludeKeyで処理主体は除外)**
  const batchMutateLists = async (
    projectId: string,
    updatedProject: EnrichedProject,
    excludeKey: string | null = null
  ) => {
    console.log("バッチ処理開始")

    const allKeys = Array.from(cache.keys()) as string[];
    console.log("キー取得", allKeys);
    console.log("excludeKey:", excludeKey);
    console.log("比較対象のキー一覧:", allKeys.map((key) => ({ key, isExcluded: key === excludeKey })));

    const keysToUpdate = allKeys.filter((key) => {
      if (key === excludeKey) return false; //一覧かつ処理主体はスキップ
      if (key.includes("/comments")) return false; //コメントはスキップ
      if (key.match(/^\/api\/projects\/\d+$/)) return false; //詳細かつ処理主体はスキップ
      if (key.includes("/notifications")) return false; // 通知はスキップ
      return key.startsWith("$inf$/api/users/") || key.startsWith("$inf$/api/projects?");
    });
    console.log("アップデートすべきキーの抽出", keysToUpdate)

    await Promise.all(
      keysToUpdate.map((key) =>
        {
          console.log(`${key}のmutate開始`);
          return mutate(
            key,
            (currentData: PageData[] | undefined) =>
              currentData?.map((page) => ({
                ...page,
                projects: page.projects.map((p) => (p.id === projectId ? updatedProject : p)),
              })),
            false
          )
        }
      )
    );
  };

  // **詳細ページのMutate処理**
  const applyMutateForShow = async (props: ApplyMutateProps) => {
    const { projectId, createApiRequest, destroyApiRequest, actionType, actionValues } = props;
    //処理主体のmutateKeyの定義
    const getKey = props.getKey as () => string | null;
    const mutateKey = getKey();
    console.log("詳細用mutate開始、getKeyは？", mutateKey);
    let targetProject: EnrichedProject;

    // **1. 楽観的更新 (オプションを活用)**
    await mutate(
      mutateKey,
      async (currentData: PageData | undefined) => {
        if (!currentData) throw new Error("現在のデータが存在しません");

        //APIリクエスト
        const response = await executeApiRequest({projectId, createApiRequest, destroyApiRequest});
        console.log("レスポンス", response);

        //最終処理
        if (!(actionType === "comment" || actionType === "unComment")){
          actionValues.id = response.id;
        }

        const finalObject = createUpdatedProject(targetProject, actionType, actionValues);
        console.log("最終処理用のオブジェクト", finalObject);

        //一覧ページの更新(除外対象なし)
          batchMutateLists(projectId, finalObject, null);

        // 詳細の更新
        console.log("詳細の最終更新処理");
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
          console.log("詳細の楽観的更新開始", prevData);
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
    console.log("一覧用mutate開始、getKeyは？", mutateKey);

    // **1. 楽観的更新**
    await mutate(
      mutateKey,
      async (currentData: PageData[] | undefined) => {
        if (!currentData) throw new Error("現在のデータが存在しません");

        // APIリクエスト
        const response = await executeApiRequest({projectId, createApiRequest, destroyApiRequest});
        console.log("レスポンス", response);
        actionValues.id = response.id;
        const finalObject = createUpdatedProject(targetProject, actionType, actionValues);
        console.log("最終処理用のオブジェクト", finalObject);

        // 他の一覧ページ更新のバッチ処理(処理主体を除く)
        batchMutateLists(projectId, finalObject, mutateKey);
        // 詳細ページの変更処理（詳細キャッシュがない場合は）
        updateProjectDetailPage(projectId, finalObject)

        // 一覧ページの確定更新
        console.log("一覧の最終更新処理");
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
          console.log("一覧の楽観的更新開始", prevData);
          return prevData.map((page) => ({
            ...page,
            projects: page.projects.map((p) => {
              if (p.id === projectId) {
                targetProject = p; // 対象オブジェクトを特定
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
    console.log("===== applyMutate 呼び出し時の props =====");
    console.log("projectId:", props.projectId);
    console.log("createApiRequest:", props.createApiRequest ? "関数がセットされています" : "未定義");
    console.log("destroyApiRequest:", props.destroyApiRequest ? "関数がセットされています" : "未定義");
    console.log("isShowMode:", props.isShowMode);
    console.log("actionType:", props.actionType);
    console.log("actionValues:", props.actionValues);
    console.log("actionValues (deep copy):", JSON.parse(JSON.stringify(props.actionValues)));
    console.log("getKey:", props.getKey);
    console.log("=======================================");

    if (props.isShowMode) {
      await applyMutateForShow(props);
    } else {
      await applyMutateForList(props);
    }
  };
  return { applyMutate };
};

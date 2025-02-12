import { useSWRConfig } from "swr";
import { EnrichedProject } from "@sharedTypes/types";
import { unstable_serialize } from "swr/infinite";
import { getIndexKey } from "@swr/useProjectSWR";
import { getMyPageKey } from "@swr/useMyProjectsSWR";
import { useProjectList } from "@swr/useProjectSWR";
import { useMyProjects } from "@swr/useMyProjectsSWR";

interface ApplyMutateProps {
  updatedProject: EnrichedProject;
  detailMutateKey?: string; //ShowページベースSWR
  listMutateKey?: string; //IndexページベースSWR
  projectIndex?: number; //対象のリソースがprojects内のどの位置にあるかを保持（詳細ページは0）
  projectId: string;
  createApiRequest?:((projectId: string) => Promise<any>) //新規処理専用
  destroyApiRequest?: ((projectId: string, relatedId: string) => Promise<any>); //削除処理専用
  finalizeData?: (response: any, project: EnrichedProject) => EnrichedProject; //リクエスト完了時の適用処理
  relatedId?: string; //削除リクエストに使用
  isShowMode: boolean;
  category?: string;
}

interface PageData {
  projects: EnrichedProject[];
  meta?: { total_pages: number; [key: string]: any }; //Showの場合はなし
}

export const useApplyMutate = () => {
  const { mutate, cache } = useSWRConfig();
  // const { mutate: indexMutate } = useProjectList()
  // const { mutate: myMutate } = useMyProjects("my_projects")
  // const { mutate: myCollaboratingMutate } = useMyProjects("collaborating")
  // const { mutate: myCollaboratedMutate } = useMyProjects("collaborated")
  // const { mutate: myBookmarksMutate } = useMyProjects("bookmarks")

  // 動的getKey取得
  const getKeyByCategory = (category: string | undefined) => {
    switch (category) {
      case "projects":
        return getIndexKey;
      case "my_projects":
      case "collaborating":
      case "collaborated":
      case "bookmarks":
        return (index: number) => getMyPageKey(index, category);
      default:
        return getIndexKey;
    }
  };

  // APIリクエストを共通化
  const executeApiRequest = async ({
    projectId,
    destroyApiRequest,
    relatedId,
    createApiRequest,
  }: {
    projectId: string;
    destroyApiRequest?: (projectId: string, relatedId: string) => Promise<any>;
    relatedId?: string;
    createApiRequest?: (projectId: string) => Promise<any>;
  }) => {
    if (destroyApiRequest && relatedId) {
      console.log("削除リクエスト開始");
      return await destroyApiRequest(projectId, relatedId);
    } else if (createApiRequest) {
      console.log("新規リクエスト開始");
      return await createApiRequest(projectId);
    } else {
      throw new Error("APIリクエスト関数が指定されていません");
    }
  };

    // SWRinfinity全体の再フェッチを強制
  const revalidateAllLists = async () => {
    console.log("一覧ページ全体の再フェッチ実行");
    // await Promise.all([
    //   indexMutate (undefined, { revalidate: false }),
    //   myMutate (undefined, { revalidate: true }),
    //   myCollaboratingMutate (undefined, { revalidate: false }),
    //   myCollaboratedMutate (undefined, { revalidate: false }),
    //   myBookmarksMutate (undefined, { revalidate: false }),
    // ])
  };

    // //処理主体以外のSWRinfinity全体の再フェッチを強制
    // const revalidateOtherLists = async (category: string | undefined) => {
    //   const mutateActions = [];

    //   if (category !== "projects") {
    //     mutateActions.push(indexMutate(undefined, { revalidate: false }));
    //   }
    //   if (category !== "my_projects") {
    //     mutateActions.push(myMutate(undefined, { revalidate: false }));
    //   }
    //   if (category !== "collaborating") {
    //     mutateActions.push(myCollaboratingMutate(undefined, { revalidate: false }));
    //   }
    //   if (category !== "collaborated") {
    //     mutateActions.push(myCollaboratedMutate(undefined, { revalidate: false}));
    //   }
    //   if (category !== "bookmarks") {
    //     mutateActions.push(myBookmarksMutate(undefined, { revalidate: false }));
    //   }
    //   console.log("mutate処理リスト", mutateActions);
    //   await Promise.all(mutateActions);
    // };

    //詳細ページ用のmutate
  const applyMutateForShow = async ({
    updatedProject,
    detailMutateKey, //オプション
    listMutateKey, //オプション
    projectIndex, //オプション
    projectId,
    createApiRequest, //オプション
    destroyApiRequest, //オプション
    finalizeData, //オプション
    relatedId, //オプション
    isShowMode,
  }: ApplyMutateProps) => {

      console.log("=== applyMutate 呼び出し ===");
      console.log("updatedProject:", updatedProject);
      console.log("detailMutateKey:", detailMutateKey);
      console.log("listMutateKey:", listMutateKey);
      console.log("projectIndex:", projectIndex);
      console.log("projectId:", projectId);
      console.log("createApiRequest:", createApiRequest ? "関数がセットされています" : "未定義");
      console.log("destroyApiRequest:", destroyApiRequest ? "関数がセットされています" : "未定義");
      console.log("finalizeData:", finalizeData ? "関数がセットされています" : "未定義");
      console.log("relatedId:", relatedId);
      console.log("isShowMode:", isShowMode);
      console.log("===========================");

      // どちらのページも開かれていない場合は異常であり処理を離脱
      if (!detailMutateKey) return;

    //Mutate処理
      await mutate( //キャッシュ更新処理
        detailMutateKey,
        async (currentData: PageData | undefined): Promise<PageData> => {
          // mutate(1.対象キー, 2. Updater関数, 3. オプション)
          console.log("mutate関数発動",detailMutateKey,currentData);

          if (!currentData) throw new Error("現在のデータが存在しません")

          // サーバーリクエスト（create/delete双方に対応）
          const response = await executeApiRequest({ projectId, destroyApiRequest, relatedId, createApiRequest });

          // レスポンスを元に更新されたプロジェクトデータを生成（finalize処理が必要なものは関数実行）
          console.log("終了データを保持", response, finalizeData);
          const finalizedProject = finalizeData
            ? finalizeData(response, updatedProject)
            : updatedProject;

          return { ...currentData, projects: [finalizedProject] };
        },
        {
          optimisticData: (prevData: PageData | undefined): PageData=> { //楽観的更新
            if (!prevData) throw new Error("楽観的更新用のデータが存在しません");
            console.log("楽観的更新発動",prevData)

            return { ...prevData, projects: [updatedProject] };
          },
          populateCache: true, // キャッシュ保存(デフォルトはtrue)
          rollbackOnError: true, // リクエストエラー時の自動ロールバック
          revalidate: false, // 更新後の再フェッチを防ぐ
        }
      );
    };

    // 一覧ページ用のmutate
  const applyMutateForList = async ({
    updatedProject,
    listMutateKey,
    projectIndex,
    projectId,
    createApiRequest,
    destroyApiRequest,
    finalizeData,
    relatedId,
    detailMutateKey,
    category,
  }: ApplyMutateProps) => {
    if (!listMutateKey || projectIndex === undefined) return;
    const getKey = getKeyByCategory(category);
    console.log("gesKeyの値", getKey);

    console.log("一覧ページの mutate 処理開始");

    await mutate(
      unstable_serialize(getKey),
      async (currentData: PageData[] | undefined): Promise<PageData[]> => {
        if (!currentData) throw new Error("現在のデータが存在しません");

        const response = await executeApiRequest({ projectId, destroyApiRequest, relatedId, createApiRequest });

        const finalizedProject = finalizeData ? finalizeData(response, updatedProject) : updatedProject;

        return currentData.map((page) => ({
          ...page,
          projects: page.projects.map((p) => (p.id === finalizedProject.id ? finalizedProject : p)),
        }));
      },
      {
        optimisticData: (prevData: PageData[] | undefined) => {
          if (!prevData) throw new Error("楽観的更新用のデータが存在しません");
          return prevData.map((page) => ({
            ...page,
            projects: page.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
          }));
        },
        populateCache: true,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

    const applyMutate = async (props: ApplyMutateProps) => {
      if (props.isShowMode) {
        await applyMutateForShow(props);
        revalidateAllLists();
      } else {
        await applyMutateForList(props);
        if (props.category !== undefined){
          console.log("渡されたカテゴリー", props.category);
          // revalidateOtherLists(props.category);
        }

      }
    };
    // return {applyMutate, revalidateOtherLists, revalidateAllLists};
    return {applyMutate,  revalidateAllLists};
  };
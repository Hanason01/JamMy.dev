import { useBookmarkRequest } from "@services/project/feedback/useBookmarkRequest";
import { useFindPageKeyByProjectId } from "@utils/useFindPageKeyAndIndexByProjectId"
import { useApplyMutate } from "@utils/useApplyMutate";
import { EnrichedProject, SetState , PageKeyResult } from "@sharedTypes/types";
import { useSWRConfig } from "swr";



export const useBookmarkToggle = () => {
  const { bookmarkProject, unBookmarkProject } = useBookmarkRequest();
  const { cache } = useSWRConfig();
  const findPageKeyByProjectId = useFindPageKeyByProjectId();
  const applyMutate = useApplyMutate();

  //初期化変数
  let isShowMode: boolean;
  let result:PageKeyResult | undefined;
  let detailMutateKey:string | undefined;
  let listMutateKey:string | undefined;
  let projectIndex:number | undefined;
  let targetProject:EnrichedProject | undefined;
  let showTargetProjects:EnrichedProject | undefined;


  // Projects更新関数（上書き用のオブジェクト作成）
  const createUpdatedProject = (
    targetProject: EnrichedProject,
    bookmarked: boolean,
    bookmarkedId: number | null
  ): EnrichedProject => {
    return {
      ...targetProject,
      attributes: {
        ...targetProject.attributes,
        bookmarked_by_current_user: bookmarked,
        current_bookmark_id: bookmarkedId,
      },
    };
  };


  //初期化処理
  const initialize = (projectId: string, mode:"list" | "detail" ) => {
    result = findPageKeyByProjectId(projectId);
    if (result){
      listMutateKey = result.mutateKey;
      projectIndex = result.projectIndex;
    }

    isShowMode = mode === "detail"? true : false;
    const hasProjectShowCache = cache.get(`/api/projects/${projectId}`) !== undefined;
    // 詳細ページの mutateKey を設定（キャッシュがなければ undefined）
    detailMutateKey = hasProjectShowCache ? `/api/projects/${projectId}` : undefined;

    //更新対象オブジェクトの抽出
    if(detailMutateKey){
      const showCache = cache.get(detailMutateKey) as { projects: EnrichedProject[] } | undefined;
      showTargetProjects = showCache?.projects?.[0];
    }
    targetProject = isShowMode && showTargetProjects
      ? showTargetProjects
      : result?.project;


    console.log("projectId: " + projectId);
    console.log("showMutateKey",detailMutateKey);
    console.log("indexMutateKey",listMutateKey);
    console.log("projectIndex",projectIndex);

    console.log("処理前の対象", targetProject);

    // キャッシュ異常時ハンドル
    if (!isShowMode && (!listMutateKey || projectIndex === undefined)) {  //一覧ページに一度アクセスしているのに、キャッシュがない異常状態
      console.error("Indexキャッシュキーが存在異常終了しました");
      return;
    } else if(isShowMode && (!detailMutateKey || projectIndex === undefined)){
      console.error("Showキャッシュキーが存在せず異常終了しました");
      return;
    }
  };

   // レスポンス適用処理(データ整合性確保)
  const createFinalizeProjects = (res: any, updatedProject: EnrichedProject) => {
    const realBookmarkId = Number(res.id);
    const finalizedProject = createUpdatedProject(updatedProject, true, realBookmarkId);

    return finalizedProject;
  }

  const destroyFinalizeProjects = (res: any, updatedProject: EnrichedProject) => {
    const realBookmarkId = Number(res.id);
    const finalizedProject = createUpdatedProject(updatedProject,false, realBookmarkId || null);

    return finalizedProject;
  }


  // ブックマーク追加関数
  const handleBookmark = async (projectId: string, mode:"list" | "detail") => {
    initialize(projectId, mode);
    const isBookmarkMode = true;

    if (!targetProject) {
      console.error("ブックマーク対象プロジェクトが見つかりませんでした");
      return;
    }
    //上書き用のオブジェクト作成
    const updatedProject = createUpdatedProject(targetProject, true, Math.random());
    console.log("updatedProject:",updatedProject);

    // 更新処理
    const createApiRequest = isBookmarkMode ? bookmarkProject : undefined;
    const destroyApiRequest = !isBookmarkMode ? unBookmarkProject : undefined;
    const finalizeData = isBookmarkMode ? createFinalizeProjects : destroyFinalizeProjects;
    applyMutate({
      updatedProject,
      detailMutateKey,
      listMutateKey,
      projectIndex,
      projectId,
      createApiRequest,
      destroyApiRequest,
      finalizeData,
      isShowMode,
    });
    console.log("追加の楽観的更新後", cache);
  };



  // ブックマーク解除関数
  const handleUnBookmark = async (projectId: string, bookmarkId: number | null, mode: "list" | "detail") => {
    if(!bookmarkId ){
      console.error("不正なブックマークIDを検知しました");
      return;
    }

    initialize(projectId, mode);
    const isBookmarkMode = false;

    if (!targetProject) {
      console.error("ブックマーク対象プロジェクトが見つかりませんでした");
      return;
    }
    const updatedProject = createUpdatedProject(targetProject, false, null);
    console.log("updatedProject", updatedProject);

    const createApiRequest = isBookmarkMode ? bookmarkProject : undefined;
    const destroyApiRequest = !isBookmarkMode ? unBookmarkProject : undefined;
    applyMutate({
      updatedProject,
      detailMutateKey,
      listMutateKey,
      projectIndex,
      projectId,
      createApiRequest,
      destroyApiRequest,
      relatedId: bookmarkId.toString(),
      isShowMode,
    });
    console.log("解除の楽観的更新後",cache);
  };

  return { handleBookmark, handleUnBookmark };
};

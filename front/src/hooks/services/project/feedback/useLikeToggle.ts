import { useLikeRequest } from "@services/project/feedback/useLikeRequest";
import { useFindPageKeyByProjectId } from "@utils/useFindPageKeyAndIndexByProjectId"
import { useApplyMutate } from "@utils/useApplyMutate";
import { EnrichedProject, SetState , PageKeyResult } from "@sharedTypes/types";
import { useSWRConfig } from "swr";



export const useLikeToggle = () => {
  const { likeProject, unlikeProject } = useLikeRequest();
  const { cache } = useSWRConfig();
  const findPageKeyByProjectId = useFindPageKeyByProjectId();
  const {applyMutate} = useApplyMutate();

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
    increment: number,
    liked: boolean,
    likeId: number | null
  ): EnrichedProject => {
    return {
      ...targetProject,
      attributes: {
        ...targetProject.attributes,
        like_count: targetProject.attributes.like_count + increment,
        liked_by_current_user: liked,
        current_like_id: likeId,
      },
    };
  };



  //初期化処理
  const initialize = (projectId: string, mode:"list" | "detail", category?: string ) => {
    result = findPageKeyByProjectId(projectId, category);
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
      const showCache = cache.get(detailMutateKey) as {data?: { projects: EnrichedProject[] }} | undefined;
      showTargetProjects = showCache?.data?.projects?.[0];
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
    } else if(isShowMode && !detailMutateKey){
      console.error("Showキャッシュキーが存在せず異常終了しました");
      return;
    }
  };

  // レスポンス適用処理(データ整合性確保)
  const createFinalizeProjects = (res: any, updatedProject: EnrichedProject) => {
    const realLikeId = Number(res.id);
    const finalizedProject = createUpdatedProject(updatedProject, 0, true, realLikeId);

    return finalizedProject;
  }

  const destroyFinalizeProjects = (res: any, updatedProject: EnrichedProject) => {
    const realLikeId = Number(res.id);
    const finalizedProject = createUpdatedProject(updatedProject, 0, false, realLikeId || null);

    return finalizedProject;
  }


  // いいね追加関数
  const handleLike = async (projectId: string, mode:"list" | "detail", category?: string) => {
    initialize(projectId, mode, category);
    const isLikeMode = true;

    if (!targetProject) {
      console.error("いいね対象プロジェクトが見つかりませんでした");
      return;
    }
    //上書き用のオブジェクト作成
    const updatedProject = createUpdatedProject(targetProject, 1, true, Math.random());

    console.log("updatedProject:",updatedProject);

    // 更新処理
    const createApiRequest = isLikeMode ? likeProject : undefined;
    const destroyApiRequest = !isLikeMode ? unlikeProject : undefined;
    const finalizeData = isLikeMode ? createFinalizeProjects : destroyFinalizeProjects;
    await applyMutate({
      updatedProject,
      detailMutateKey,
      listMutateKey,
      projectIndex,
      projectId,
      createApiRequest,
      destroyApiRequest,
      finalizeData,
      isShowMode,
      category,
    });
    console.log("追加の楽観的更新後", cache);
  };



  // いいね解除関数
  const handleUnlike = async (projectId: string, likeId: number | null, mode: "list" | "detail", category?: string) => {
    if(!likeId ){
      console.error("不正ないいねIDを検知しました");
      return;
    }

    initialize(projectId, mode, category);
    const isLikeMode = false;

    if (!targetProject) {
      console.error("いいね対象プロジェクトが見つかりませんでした");
      return;
    }
    const updatedProject = createUpdatedProject(targetProject, -1, false, null);
    console.log("updatedProject", updatedProject);

    const createApiRequest = isLikeMode ? likeProject : undefined;
    const destroyApiRequest = !isLikeMode ? unlikeProject : undefined;
    applyMutate({
      updatedProject,
      detailMutateKey,
      listMutateKey,
      projectIndex,
      projectId,
      createApiRequest,
      destroyApiRequest,
      relatedId: likeId.toString(),
      isShowMode,
      category,
    });
    console.log("解除の楽観的更新後", cache);
  };


  return { handleLike, handleUnlike };
};

import { useLikeRequest } from "@services/project/feedback/useLikeRequest";
import { useFindPageKeyByProjectId } from "@utils/useFindPageKeyAndIndexByProjectId"
import { useApplyMutate } from "@utils/useApplyMutate";
import { EnrichedProject, SetState , PageKeyResult } from "@sharedTypes/types";
import { useSWRConfig } from "swr";



export const useLikeToggle = (
  { projects,
    setProjects
  } : {
    projects?: EnrichedProject[]
    setProjects?: SetState<EnrichedProject[]>;
  }) => {
  const { likeProject, unlikeProject } = useLikeRequest();
  const { cache } = useSWRConfig();
  const findPageKeyByProjectId = useFindPageKeyByProjectId();
  const applyMutate = useApplyMutate();

  //初期化変数
  let isShowMode:boolean;
  let result:PageKeyResult;
  let mutateKey:string;
  let projectIndex:number;
  let targetProject:EnrichedProject;


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


  // Showのprojects更新関数
  const applyShowProject = (
    updatedProject: EnrichedProject,
    mutateKey: string,
    projectIndex: number,
    isShowMode: boolean,
    projectId: string,
    isLikeMode: boolean,
    relatedId?: string
  ) => {
    if (!isShowMode) {
      if (!mutateKey || projectIndex === undefined) {
        console.error("キャッシュが初期化されていません");
        return;
      }
      const createApiRequest = isLikeMode ? likeProject : undefined;
      const destroyApiRequest = !isLikeMode ? unlikeProject : undefined;
      const finalizeData = isLikeMode ? createFinalizeProjects : destroyFinalizeProjects;

      applyMutate({
        updatedProject,
        mutateKey,
        projectIndex,
        projectId,
        createApiRequest,
        destroyApiRequest,
        finalizeData,
        relatedId,
      });  // 一覧ページを一度でも表示した場合は一覧用キャッシュも更新
    }
    // Show自身のコレクションの楽観的更新
    if (setProjects) {
      setProjects([updatedProject]);
    }
  };

  //キャッシュ後のShowページの終了処理
  const updateShowProjectFromCache = (
    updatedProject: EnrichedProject,
    mutateKey: string,
    projectIndex: number,
    setProjects?: SetState<EnrichedProject[]>
  ) => {
    const cacheData = cache.get(mutateKey);
    console.log("詳細ページが終了処理をする為に取得したcacheData: " + cacheData);

    if (!cacheData || !Array.isArray(cacheData.data.projects)) {
      console.error("指定されたmutateKeyからのデータ取得に失敗しました。");
      return;
    }

    const updatedCacheProject = cacheData.data.projects[projectIndex];

    if (!updatedCacheProject) {
      console.error("キャッシュから最新のプロジェクトデータが取得できませんでした。");
      return;
    }
    const realLikeId = updatedCacheProject.attributes.current_like_id;
    const finalizedProject = createUpdatedProject(
      updatedProject,
      0,
      updatedCacheProject.attributes.liked_by_current_user,
      realLikeId || null
    );

    if (setProjects) {
      setProjects([finalizedProject]);
    }
  };


  //初期化処理
  const initialize = (projectId: string) => {
    const projectListCacheKey = '/api/projects?page=1';
    const hasProjectListCache = cache.get(projectListCacheKey) !== undefined;
    isShowMode = !hasProjectListCache; //一覧キャッシュがない場合、つまり初回にShowリンクを踏み、投稿一覧ページにアクセスしていない（SWRを初期化していない）場合
    if (!isShowMode){
      result = findPageKeyByProjectId(projectId);
      mutateKey = result.mutateKey;
      projectIndex = result.projectIndex;
    }

    targetProject = isShowMode ? projects![0] : result?.project //ShowModeの際は対象のオブジェクトをそのまま取得する

    console.log("projectId: " + projectId);
    console.log("mutateKey",mutateKey);
    console.log("projectIndex",projectIndex);

    console.log("処理前の対象", targetProject);

    if (!isShowMode && (!mutateKey || projectIndex === undefined)) {  //一覧ページに一度アクセスしているのに、キャッシュがない状態
      console.error("キャッシュキーが存在せず、Indexを抽出できませんでした");
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
  const handleLike = async (projectId: string) => {
    initialize(projectId);
    const isLikeMode = true;

    if (!targetProject) {
      console.error("いいね対象プロジェクトが見つかりませんでした");
      return;
    }
    //上書き用のオブジェクト作成
    const updatedProject = createUpdatedProject(targetProject, 1, true, Math.random());
    console.log("updatedProject:",updatedProject);

    //更新処理関係
    if (isShowMode){
      applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isLikeMode);
      const res = await likeProject(projectId);
      const finalizedProject = createFinalizeProjects(res, updatedProject);
      if (setProjects) {
        setProjects([finalizedProject]);
      }

    } else {

      if (!mutateKey || projectIndex === undefined) { //projectIndexが0のケースではfalsyとなる為、文字列とは区別
        console.error("キャッシュが初期化されていません");
        return;
      }

      if (projects){ //isShowModeではない詳細ページの場合
        await applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isLikeMode);
        // 更新後のキャッシュから最新のlikeIdを取得
        updateShowProjectFromCache(updatedProject, mutateKey, projectIndex, setProjects);

      }else{ //一覧ページの場合
        const createApiRequest = isLikeMode ? likeProject : undefined;
        const destroyApiRequest = !isLikeMode ? unlikeProject : undefined;
        const finalizeData = isLikeMode ? createFinalizeProjects : destroyFinalizeProjects;
        applyMutate({
          updatedProject,
          mutateKey,
          projectIndex,
          projectId,
          createApiRequest,
          destroyApiRequest,
          finalizeData
        });
      }
    }
    console.log("追加の楽観的更新後", projects, cache);
  };



  // いいね解除関数
  const handleUnlike = async (projectId: string, likeId: number | null) => {
    if( !likeId ){
      console.error("不正ないいねIDを検知しました");
      return;
    }

    initialize(projectId);

    const isLikeMode = false;

    if (!targetProject) {
      console.error("いいね対象プロジェクトが見つかりませんでした");
      return;
    }
    const updatedProject = createUpdatedProject(targetProject, -1, false, null);
    console.log("updatedProject", updatedProject);

    if (isShowMode){
      applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isLikeMode, likeId.toString());
      const res = await unlikeProject(projectId, likeId.toString());
      const finalizedProject = destroyFinalizeProjects(res, updatedProject);
      if (setProjects) {
        setProjects([finalizedProject]);
      }
    } else{

      if (!mutateKey || projectIndex === undefined) { //projectIndexが0のケースではfalsyとなる為、文字列とは区別
        console.error("キャッシュが初期化されていません");
        return;
      }

      if (projects){ //isShowModeではない詳細ページの場合
        await applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isLikeMode, likeId.toString());
        // 更新後のキャッシュから最新のlikeIdを取得
        updateShowProjectFromCache(updatedProject, mutateKey, projectIndex, setProjects);

      }else{
        const createApiRequest = isLikeMode ? likeProject : undefined;
        const destroyApiRequest = !isLikeMode ? unlikeProject : undefined;
        applyMutate({
          updatedProject,
          mutateKey,
          projectIndex,
          projectId,
          createApiRequest,
          destroyApiRequest,
          relatedId: likeId.toString()
        });
      }
    }
    console.log("解除の楽観的更新後", projects, cache);
  };

  return { handleLike, handleUnlike };
};

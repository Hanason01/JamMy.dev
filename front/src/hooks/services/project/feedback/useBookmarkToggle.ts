import { useBookmarkRequest } from "@services/project/feedback/useBookmarkRequest";
import { useFindPageKeyByProjectId } from "@utils/useFindPageKeyAndIndexByProjectId"
import { useApplyMutate } from "@utils/useApplyMutate";
import { EnrichedProject, SetState , PageKeyResult } from "@sharedTypes/types";
import { useSWRConfig } from "swr";



export const useBookmarkToggle = (
  { projects,
    setProjects
  } : {
    projects?: EnrichedProject[]
    setProjects?: SetState<EnrichedProject[]>;
  }) => {
  const { bookmarkProject, unBookmarkProject } = useBookmarkRequest();
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


  // Showのprojects更新関数
  const applyShowProject = (
    updatedProject: EnrichedProject,
    mutateKey: string,
    projectIndex: number,
    isShowMode: boolean,
    projectId: string,
    isBookmarkMode: boolean,
    relatedId?: string
  ) => {
    if (!isShowMode) {
      if (!mutateKey || projectIndex === undefined) {
        console.error("キャッシュが初期化されていません");
        return;
      }
      const createApiRequest = isBookmarkMode ? bookmarkProject : undefined;
      const destroyApiRequest = !isBookmarkMode ? unBookmarkProject : undefined;
      const finalizeData = isBookmarkMode ? createFinalizeProjects : destroyFinalizeProjects;

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
    // Show自身のコレクションの更新
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
    const realBookmarkId = updatedCacheProject.attributes.current_bookmark_id;
    const finalizedProject = createUpdatedProject(updatedProject, updatedCacheProject.attributes.bookmarked_by_current_user, realBookmarkId || null);

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
  const handleBookmark = async (projectId: string) => {
    initialize(projectId);
    const isBookmarkMode = true;

    if (!targetProject) {
      console.error("ブックマーク対象プロジェクトが見つかりませんでした");
      return;
    }
    //上書き用のオブジェクト作成
    const updatedProject = createUpdatedProject(targetProject, true, Math.random());
    console.log("updatedProject:",updatedProject);

    //更新処理関係
    if (isShowMode){
      applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isBookmarkMode);
      const res = await bookmarkProject(projectId);
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
        await applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isBookmarkMode);
        // 更新後のキャッシュから最新のbookmarkIdを取得
        updateShowProjectFromCache(updatedProject, mutateKey, projectIndex, setProjects);

      }else{ //一覧ページの場合
        const createApiRequest = isBookmarkMode ? bookmarkProject : undefined;
        const destroyApiRequest = !isBookmarkMode ? unBookmarkProject : undefined;
        const finalizeData = isBookmarkMode ? createFinalizeProjects : destroyFinalizeProjects;
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



  // ブックマーク解除関数
  const handleUnBookmark = async (projectId: string, bookmarkId: number | null) => {
    if( !bookmarkId ){
      console.error("不正なブックマークIDを検知しました");
      return;
    }

    initialize(projectId);

    const isBookmarkMode = false;

    if (!targetProject) {
      console.error("ブックマーク対象プロジェクトが見つかりませんでした");
      return;
    }
    const updatedProject = createUpdatedProject(targetProject, false, null);
    console.log("updatedProject", updatedProject);

    if (isShowMode){
      applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isBookmarkMode, bookmarkId.toString());
      const res = await unBookmarkProject(projectId, bookmarkId.toString());
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
        await applyShowProject(updatedProject, mutateKey, projectIndex, isShowMode, projectId, isBookmarkMode, bookmarkId.toString());
        // 更新後のキャッシュから最新のbookmarkIdを取得
        updateShowProjectFromCache(updatedProject, mutateKey, projectIndex, setProjects);

      }else{
        const createApiRequest = isBookmarkMode ? bookmarkProject : undefined;
        const destroyApiRequest = !isBookmarkMode ? unBookmarkProject : undefined;
        applyMutate({
          updatedProject,
          mutateKey,
          projectIndex,
          projectId,
          createApiRequest,
          destroyApiRequest,
          relatedId: bookmarkId.toString()
        });
      }
    }
    console.log("解除の楽観的更新後", projects, cache);
  };

  return { handleBookmark, handleUnBookmark };
};

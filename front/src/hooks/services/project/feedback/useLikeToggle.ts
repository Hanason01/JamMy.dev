import { useClientCacheContext } from "@context/useClientCacheContext";
import { useLikeRequest } from "@services/project/feedback/useLikeRequest";
import { EnrichedProject, SetState } from "@sharedTypes/types";

export const useLikeToggle = (
  { projects, setProjects }: { projects: EnrichedProject[]; setProjects: SetState<EnrichedProject[]>; }
) => {
  const { cachedProject, setCachedProject } = useClientCacheContext();
  const { likeProject, unlikeProject } = useLikeRequest();



  // 共通の状態更新関数
  const updateProjectState = (
    targetProjects: EnrichedProject[],
    projectIndex: number,
    increment: number,
    liked: boolean,
    likeId: number | null
  ) => {
    if (projectIndex === -1) return targetProjects; // 対象がない場合は離脱

    const updatedProjects = [...targetProjects];
    updatedProjects[projectIndex] = {
      ...updatedProjects[projectIndex],
      attributes: {
        ...updatedProjects[projectIndex].attributes,
        like_count: updatedProjects[projectIndex].attributes.like_count + increment,
        liked_by_current_user: liked,
        current_like_id: likeId,
      },
    };
    return updatedProjects;
  };


  // 共通のロールバック関数
  const rollbackProjectState = (
    targetProjects: EnrichedProject[],
    projectIndex: number,
    increment: number,
    liked: boolean,
    likeId: number | null
  ) => {
    return updateProjectState(targetProjects, projectIndex, increment, liked, likeId);
  };



  // いいね追加関数
  const handleLike = async (projectId: string) => {
    const projectIndex = projects.findIndex((p) => String(p.attributes.id) === projectId);
    const cachedProjectIndex = cachedProject.findIndex((p) => String(p.attributes.id) === projectId);

    if (projectIndex === -1) {
      console.error("プロジェクトが見つかりません");
      return;
    }

    const fakeLikeId = Math.random(); // 仮ID

    // 楽観的更新
    setProjects(updateProjectState(projects, projectIndex, 1, true, fakeLikeId));
    setCachedProject(updateProjectState(cachedProject, cachedProjectIndex, 1, true, fakeLikeId));

    try {
      await likeProject(projectId);
    } catch (error) {
      console.error("いいねのリクエストに失敗しました:", error);

      // ロールバック
      setProjects(rollbackProjectState(projects, projectIndex, -1, false, null));
      setCachedProject(rollbackProjectState(cachedProject, cachedProjectIndex, -1, false, null));
    }
  };



  // いいね解除関数
  const handleUnlike = async (projectId: string, likeId: number | null) => {
    const projectIndex = projects.findIndex((p) => String(p.attributes.id) === projectId);
    const cachedProjectIndex = cachedProject.findIndex((p) => String(p.attributes.id) === projectId);

    if (projectIndex === -1) {
      console.error("プロジェクトが見つかりません");
      return;
    }

    // 楽観的更新
    setProjects(updateProjectState(projects, projectIndex, -1, false, null));
    setCachedProject(updateProjectState(cachedProject, cachedProjectIndex, -1, false, null));

    try {
      if (likeId) {
        await unlikeProject(projectId, likeId.toString());
      }
    } catch (error) {
      console.error("いいね解除のリクエストに失敗しました:", error);

      // ロールバック
      setProjects(rollbackProjectState(projects, projectIndex, 1, true, likeId));
      setCachedProject(rollbackProjectState(cachedProject, cachedProjectIndex, 1, true, likeId));
    }
  };

  return { handleLike, handleUnlike };
};

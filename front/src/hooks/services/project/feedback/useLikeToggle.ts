import { useLikeRequest } from "@services/project/feedback/useLikeRequest";
import { useApplyMutate } from "@utils/useApplyMutate";
import { useSWRConfig } from "swr";
import { GetKeyType } from "@sharedTypes/types";


export const useLikeToggle = () => {
  const { likeProject, unlikeProject } = useLikeRequest();
  const { cache } = useSWRConfig();
  const {applyMutate} = useApplyMutate();


  // いいね追加関数
  const handleLike = async (projectId: string, mode:"list" | "detail", getKey: GetKeyType) => {
    const isShowMode = mode === "detail"? true : false;
    const isLikeMode = true;

    // 更新処理
    const createApiRequest = isLikeMode ? () => likeProject(projectId) : undefined;
    const destroyApiRequest = undefined;

    await applyMutate({
      projectId,
      createApiRequest,
      destroyApiRequest,
      isShowMode,
      actionType: "like",
      actionValues:{increment: 1 , by_current_user: true, id: Math.random()},
      getKey
    });
    // console.log("追加の楽観的更新後", cache);
  };



  // いいね解除関数
  const handleUnlike = async (projectId: string, likeId: number | null, mode: "list" | "detail", getKey: GetKeyType) => {
    if(!likeId ){
      console.error("不正ないいねIDを検知しました");
      return;
    }
    const isShowMode = mode === "detail"? true : false;
    const isLikeMode = false;

    const createApiRequest = undefined;
    const destroyApiRequest = !isLikeMode ? (likeId ? () => unlikeProject(projectId, likeId.toString()) : undefined) : undefined;

    applyMutate({
      projectId,
      createApiRequest,
      destroyApiRequest,
      isShowMode,
      actionType: "unLike",
      actionValues:{increment: -1, by_current_user: false, id: null},
      getKey
    });
    // console.log("解除の楽観的更新後", cache);
  };


  return { handleLike, handleUnlike };
};

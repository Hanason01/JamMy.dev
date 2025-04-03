import { useBookmarkRequest } from "@services/project/feedback/useBookmarkRequest";
import { useApplyMutate } from "@utils/useApplyMutate";
import { useSWRConfig } from "swr";
import { GetKeyType } from "@sharedTypes/types";


export const useBookmarkToggle = () => {
  const { bookmarkProject, unBookmarkProject } = useBookmarkRequest();
  const { cache } = useSWRConfig();
  const {applyMutate} = useApplyMutate();


  const handleBookmark = async (projectId: string, mode:"list" | "detail", getKey: GetKeyType) => {
    const isShowMode = mode === "detail"? true : false;
    const isBookmarkMode = true;
    const createApiRequest = isBookmarkMode ? () => bookmarkProject(projectId) : undefined;
    const destroyApiRequest = undefined;

    await applyMutate({
      projectId,
      createApiRequest,
      destroyApiRequest,
      isShowMode,
      actionType: "bookmark",
      actionValues:{by_current_user: true, id: Math.random()},
      getKey
    });
  };



  const handleUnBookmark = async (projectId: string, bookmarkId: number | null, mode: "list" | "detail", getKey: GetKeyType) => {
    if(!bookmarkId){
      console.error("不正なブックマークIDを検知しました");
      return;
    }
    const isShowMode = mode === "detail"? true : false;
    const isBookmarkMode = false;

    const createApiRequest = undefined;
    const destroyApiRequest = !isBookmarkMode ? (bookmarkId ? () => unBookmarkProject(projectId, bookmarkId.toString()) : undefined) : undefined;

    applyMutate({
      projectId,
      createApiRequest,
      destroyApiRequest,
      isShowMode,
      actionType: "unBookmark",
      actionValues:{by_current_user: false, id: null},
      getKey
    });
  };


  return { handleBookmark, handleUnBookmark };
};

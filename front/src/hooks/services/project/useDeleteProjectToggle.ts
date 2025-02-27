import { useDeleteProjectRequest } from "@services/project/useDeleteProjectRequest";
import { useApplyMutate } from "@utils/useApplyMutate";
import { useSWRConfig } from "swr";
import { GetKeyType } from "@sharedTypes/types";

export const useDeleteProjectToggle = () => {
  const { deleteProject } = useDeleteProjectRequest();
  const { cache } = useSWRConfig();
  const {applyMutate} = useApplyMutate();


  // 投稿削除関数
  const handleDeleteProjectSWR = async (projectId: string, mode:"list" | "detail", getKey: GetKeyType) => {
    const isShowMode = mode === "detail";

    // 更新処理
    const createApiRequest = undefined;
    const destroyApiRequest = () => deleteProject(projectId);

    await applyMutate({
      projectId,
      createApiRequest,
      destroyApiRequest,
      isShowMode,
      actionType: "delete",
      actionValues:{},
      getKey
    });
    // console.log("追加の楽観的更新後", cache);
  };

  return { handleDeleteProjectSWR };
};

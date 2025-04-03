import { useCommentRequest } from "@services/project/feedback/useCommentRequest";
import { useApplyMutate } from "@utils/useApplyMutate";
import { useSWRConfig } from "swr";
import { GetKeyType, PostCommentFormData } from "@sharedTypes/types";


export const useCommentToggle = () => {
  const { postCommentProject, deleteCommentProject } = useCommentRequest();
  const { cache } = useSWRConfig();
  const {applyMutate} = useApplyMutate();


  const handleCreateComment = async (data: PostCommentFormData, projectId: string, getKey: GetKeyType) => {
    const isShowMode = true;
    const isCreateMode = true;
    const createApiRequest = isCreateMode ? () => postCommentProject(data, projectId) : undefined;
    const destroyApiRequest =  undefined;

    await applyMutate({
      projectId,
      createApiRequest,
      destroyApiRequest,
      isShowMode,
      actionType: "comment",
      actionValues:{increment: 1},
      getKey
    });
  };



  const handleUnComment = async (projectId: string, commentId: number, getKey: GetKeyType) => {
    if(!commentId ){
      console.error("不正ないいねIDを検知しました");
      return;
    }
    const isShowMode = true;
    const isCreateMode = false;

    const createApiRequest = undefined;
    const destroyApiRequest = !isCreateMode ? (commentId ? () => deleteCommentProject(projectId, commentId.toString()) : undefined) : undefined;

    applyMutate({
      projectId,
      createApiRequest,
      destroyApiRequest,
      isShowMode,
      actionType: "unComment",
      actionValues:{increment: -1},
      getKey
    });
  };
  return { handleCreateComment, handleUnComment };
};

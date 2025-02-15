import { useCommentRequest } from "@services/project/feedback/useCommentRequest";
import { useApplyMutate } from "@utils/useApplyMutate";
import { useSWRConfig } from "swr";
import { GetKeyType, PostCommentFormData } from "@sharedTypes/types";


export const useCommentToggle = () => {
  const { postCommentProject, deleteCommentProject } = useCommentRequest();
  const { cache } = useSWRConfig();
  const {applyMutate} = useApplyMutate();


  // コメント作成関数
  const handleCreateComment = async (data: PostCommentFormData, projectId: string, getKey: GetKeyType) => {
    const isShowMode = true;
    const isCreateMode = true;

    // 更新処理
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
    console.log("追加の楽観的更新後", cache);
  };



  // コメント削除関数
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
    console.log("解除の楽観的更新後", cache);
  };


  return { handleCreateComment, handleUnComment };
};

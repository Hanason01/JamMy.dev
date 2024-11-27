import { handleStatusErrors } from "../ErrorHandler";
import { useRequest } from '../useRequestWrapper';
import { useRouter } from "next/navigation";

export const useCollaborationRequest = () => {
  const { get } = useRequest();
  const router = useRouter();

  const collaborationNewRequest = async (project) => {
    try {
      const response = await get(`/api/v1/projects/${project.id}/collaborations/new`, { withCredentials: true });
      // 応募フォームページに遷移
      router.push("/project/collaborationForm");
    } catch (error) {
      if (error.response) {
        handleStatusErrors(error.response.status); // ステータスエラーハンドル
      } else if (error.request) {
        throw new Error("ネットワークエラーが発生しました。");
      } else {
        throw new Error("エラーが発生しました。");
      }
      throw error; // 上位のエラーハンドラに通知
    }
  };

  return { collaborationNewRequest };
};
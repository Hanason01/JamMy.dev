import { handleStatusErrors } from "@services/ErrorHandler";
import { useRequest } from '@services/useRequestWrapper';
import { useRouter } from "next/navigation";
import { Project } from "@sharedTypes/types";

export const useCollaborationRequest = () => {
  const { get } = useRequest();
  const router = useRouter();

  const collaborationNewRequest = async (project: Project): Promise<void> => {
    try {
      await get(`/api/v1/projects/${project.id}/collaborations/new`);
      // 応募フォームページに遷移
      router.push(`/projects/${project.id}/collaboration`);
    } catch (error: any) {
      if (error.response) {
        handleStatusErrors(error.response.status); // ステータスエラーハンドル
      } else if (error.request) {
        throw new Error("ネットワークエラーが発生しました。");
      } else {
        throw new Error("エラーが発生しました。");
      }
    }
  };

  return { collaborationNewRequest };
};
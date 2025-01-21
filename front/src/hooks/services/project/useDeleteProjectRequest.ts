import axios from 'axios';
import { handleStatusErrors } from "@services/ErrorHandler";

export const useDeleteProjectRequest = () => {
  const deleteProject = async (project_id: string): Promise<any> => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${project_id}`, { withCredentials: true });
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

  return { deleteProject };
}

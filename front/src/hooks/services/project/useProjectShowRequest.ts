import axios from "axios";
import { handleStatusErrors } from "@services/ErrorHandler";
import { ProjectShowResponse } from "@sharedTypes/types";

export const useProjectShowRequest = () => {
  const projectShowRequest = async (project_id: string): Promise<ProjectShowResponse> => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${project_id}`);
      return{
        data: response.data.data,
        included: response.data.included || [],
      }
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

  return { projectShowRequest };
}

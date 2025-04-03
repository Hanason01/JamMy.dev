import axios from "axios";
import { handleStatusErrors } from "@services/ErrorHandler";
import { ProjectIndexResponse } from "@sharedTypes/types";

export const useProjectIndexRequest = () => {
  const projectIndexRequest = async (page: number): Promise<ProjectIndexResponse> => {
    try {
      const response = await axios.get(`/api/projects`, { params: {page}, withCredentials: true,});
      return{
        data: response.data.data,
        included: response.data.included || [],
        meta: response.data.meta,
      }
    } catch (error: any) {
      if (error.response) {
        handleStatusErrors(error.response.status);
      } else if (error.request) {
        throw new Error("ネットワークエラーが発生しました。");
      } else {
        throw new Error("エラーが発生しました。");
      }
    }
  };

  return { projectIndexRequest };
}

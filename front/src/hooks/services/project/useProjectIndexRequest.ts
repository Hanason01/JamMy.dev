import axios from 'axios';
import { handleStatusErrors } from "@services/ErrorHandler";
import { ProjectIndexResponse } from "@sharedTypes/types";

export const useProjectIndexRequest = () => {
  const projectIndexRequest = async (page: number): Promise<ProjectIndexResponse> => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects`, { params: {page}});
      return{
        data: response.data.data, // 投稿データ
        included: response.data.included || [], // 関連データ（存在しない場合は空配列）
        meta: response.data.meta,
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

  return { projectIndexRequest };
}

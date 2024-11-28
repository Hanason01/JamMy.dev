import axios from 'axios';
import { handleStatusErrors } from "../ErrorHandler";
import { useRequest } from '../useRequestWrapper';



export const projectIndexRequest = async (data) => {
  const { get } = useRequest();
  try {
    const response = await get(`/api/v1/projects`);
    return{
      data: response.data.data, // 投稿データ
      included: response.data.included || [], // 関連データ（存在しない場合は空配列）
    }
  } catch (error) {
    if (error.response) {
      handleStatusErrors(error.response.status); // ステータスエラーハンドル
    } else if (error.request) {
      throw new Error("ネットワークエラーが発生しました。");
    } else {
      throw new Error("エラーが発生しました。");
    }
  }
};
import axios from 'axios';
import { handleStatusErrors } from "./ErrorHandler";

export const projectIndexRequest = async (data) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects`, data, { withCredentials: true });
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error("予期しないデータ形式が返されました。");
    }
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
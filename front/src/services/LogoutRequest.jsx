import axios from "axios";
import { handleStatusErrors } from "./ErrorHandler";

export const LogoutRequest = async () => {
  try {
    // Devise Token Auth のログアウトエンドポイントにリクエスト
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign_out`, { withCredentials: true });
    console.log("ログアウトしました");
  } catch (error) {
    if (error.response){
      handleStatusErrors(error.response.status); // ステータスエラーをハンドル
    } else if (error.request){
      throw new Error("ネットワークエラーが発生しました。");
    }else {
      throw new Error("エラーが発生しました。");
    }
  }
};


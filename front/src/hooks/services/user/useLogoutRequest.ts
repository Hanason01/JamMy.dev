"use client";

import { useAuthContext } from "@context/useAuthContext";
import { useFeedbackContext } from "@context/useFeedbackContext";
import { useRouter } from "next/navigation";
import { useRequest } from "@services/useRequestWrapper";

export const useLogoutRequest = () => {
  const { handleLogout } = useAuthContext();
  const { setFeedbackByKey } = useFeedbackContext();
  const { del } = useRequest();
  const router = useRouter();

  const logout = async (): Promise<void> => {
    try {
      const response = await del(`/auth/sign_out`, { withCredentials: true });
      if (response.status === 200) {
        localStorage.removeItem("authenticatedUser");
        handleLogout(); //認証状態リセット
        window.location.href = "/projects?feedback=logout:success";
      }


    } catch (error: any) {
      //401=トークン無効を想定。404=ログアウト済を想定
      if (error.response?.status === 401 || error.response?.status === 404) {
        setFeedbackByKey("logout:info");
        handleLogout(); //強制的にログアウト状態に初期化する
      } else {
        console.error("ログアウト処理に失敗しました", error);
        setFeedbackByKey("logout:error");
        throw error;
      }
    }
  };

  return { logout };
};

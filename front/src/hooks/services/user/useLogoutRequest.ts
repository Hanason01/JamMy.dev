"use client";

import { useAuthContext } from "@context/useAuthContext";
import { useRouter } from "next/navigation";
import { useRequest } from "@services/useRequestWrapper";

export const useLogoutRequest = () => {
  const { handleLogout } = useAuthContext();
  const { del } = useRequest();
  const router = useRouter();

  const logout = async (): Promise<void> => {
    try {
      const response = await del(`/auth/sign_out`, { withCredentials: true });
      if (response.status === 200) {
        handleLogout(); //認証状態リセット
        router.push("/projects?refresh=true");
      }


    } catch (error: any) {
      //401=トークン無効を想定。404=ログアウト済を想定
      if (error.response?.status === 401 || error.response?.status === 404) {
      } else {
        console.error("ログアウト処理に失敗しました", error);
        throw error;
      }
    }
  };

  return { logout };
};

import { useAuthContext } from "../../../context/useAuthContext";
import { useRouter } from "next/navigation";
import { useRequest } from "../useRequestWrapper";

export const useLogoutRequest = () => {
  const { handleLogout } = useAuthContext();
  const { del } = useRequest();
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await del(`/auth/sign_out`, { withCredentials: true });
      if (response.status === 200) {
        handleLogout(); //認証状態リセット
        router.push("/project");
      }
    } catch (error) {
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

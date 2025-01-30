import { LoginFormData, User, SignInError } from "@sharedTypes/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@context/useAuthContext";
import { useFeedbackContext } from "@context/useFeedbackContext";


interface SignInResponse {
  data: User;
}

export const useSignInRequest = ({redirectTo} : {redirectTo?:string}) => {
  const { handleLoginSuccess, isAuthenticated } = useAuthContext();
  const { setFeedbackByKey } = useFeedbackContext();
  const router = useRouter();

  const signIn = async (data: LoginFormData): Promise<void> => {
    try {
      const response = await axios.post<SignInResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign_in`, data, { withCredentials: true });
      await handleLoginSuccess(response.data.data);

      setFeedbackByKey("signin:success");

      if (redirectTo) {
        sessionStorage.removeItem("redirectTo");
        router.replace(redirectTo);
      } else {
        router.replace("/projects")
      }

    } catch (error: any) {
      const formattedErrors: SignInError = {};

      if (error.response?.data?.errors) {
        if (error.response.data.errors.email) {
          formattedErrors.email = error.response.data.errors.email[0];
        }
        if (error.response.data.errors.password) {
          formattedErrors.password = error.response.data.errors.password[0];
        }
      }

      if (error.response?.status === 401 && error.response.data.errors) {
          formattedErrors.general = "メールアドレスもしくはパスワードが正しくありません";
      } else {
        formattedErrors.general = "エラーが発生しました。再度お試しください。";
      }
      throw formattedErrors;
    }
  };

  return { signIn };
};

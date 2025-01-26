import { LoginFormData, User, SignInError } from "@sharedTypes/types";
import axios from "axios";
import { useAuthContext } from "@context/useAuthContext";

interface SignInResponse {
  data: User;
}

export const useSignInRequest = () => {
  const { handleLoginSuccess, isAuthenticated } = useAuthContext();

  const signIn = async (data: LoginFormData): Promise<SignInResponse> => {
    try {
      const response = await axios.post<SignInResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign_in`, data, { withCredentials: true });
      handleLoginSuccess(response.data.data);
      console.log("handleLoginSuccessが終了した後のisAuthenticated",isAuthenticated);
      return response.data;
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

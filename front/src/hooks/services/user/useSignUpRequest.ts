import { SignUpRequestData, User, SignUpError } from "@sharedTypes/types";
import axios from "axios";

interface SignUpResponse {
  data: User;
}

export const useSignUpRequest = () => {
  const signUp = async (data: SignUpRequestData): Promise<SignUpResponse> => {
    try {
      const response = await axios.post<SignUpResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth`, data, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      const formattedErrors: SignUpError = {};

      if (error.response?.data?.errors) {
        if (error.response.data.errors.email) {
          formattedErrors.email = error.response.data.errors.email[0];
        }
        if (error.response.data.errors.password) {
          formattedErrors.password = error.response.data.errors.password[0];
        }
        if (error.response.data.errors.nickname) {
          formattedErrors.nickname = error.response.data.errors.nickname[0];
        }
      } else {
        formattedErrors.general = "エラーが発生しました。再度お試しください。";
      }
      throw formattedErrors;
    }
  };
  return { signUp };
};

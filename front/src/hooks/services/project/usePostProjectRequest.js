import axios from 'axios'
import { handleStatusErrors } from '../ErrorHandler';

export const usePostProjectRequest = () => {
  const postProject = async (data) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      const formattedErrors = {};

      if (error.response) {
        // ステータスコードエラーハンドリング
        try {
          handleStatusErrors(error.response.status);
        } catch (statusError) {
          formattedErrors.general = statusError.message;
        }

        // バリデーションエラーハンドリング
        if (error.response.data?.errors) {
          if (error.response.data.errors.title) {
            formattedErrors.title = error.response.data.errors.title[0];
          }
          if (error.response.data.errors.description) {
            formattedErrors.description = error.response.data.errors.description[0];
          }
        }
      } else {
        // ネットワークエラーやその他のエラー
        formattedErrors.general = "ネットワークエラーが発生しました。再度お試しください。";
      }
      throw formattedErrors;
    }
  };

  return { postProject };
};
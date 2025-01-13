import axios from 'axios'
import { handleStatusErrors } from '@services/ErrorHandler';

export const usePostCollaborationRequest = () => {
  const postCollaboration = async (data: FormData, project_id: string): Promise<any> => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${project_id}/collaborations`, data, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      const formattedErrors: { [key: string]: string } = {};

      if (error.response) {
        // ステータスコードエラーハンドリング
        try {
          handleStatusErrors(error.response.status);
        } catch (statusError: any) {
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

  return { postCollaboration };
};

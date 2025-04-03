import axios from "axios"
import { handleStatusErrors } from "@services/ErrorHandler";

export const useCompleteCollaborationManagementRequest = () => {
  const completeCollaborationManagement = async (project_id: string, data: FormData): Promise<any> => {
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${project_id}/collaboration_managements`, data, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      const formattedErrors: { [key: string]: string } = {};

      if (error.response) {
        try {
          handleStatusErrors(error.response.status);
        } catch (statusError: any) {
          formattedErrors.general = statusError.message;
        }
      } else {
        formattedErrors.general = "ネットワークエラーが発生しました。再度お試しください。";
      }
      throw formattedErrors;
    }
  };

  return { completeCollaborationManagement };
};

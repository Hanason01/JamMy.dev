import axios from "axios";
import { handleStatusErrors } from "@services/ErrorHandler";
import { useFeedbackContext } from "@context/useFeedbackContext";

export const useDeleteProjectRequest = () => {
  const { setFeedbackByKey } = useFeedbackContext();

  const deleteProject = async (project_id: string): Promise<void> => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${project_id}`, { withCredentials: true });

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 404) {
          setFeedbackByKey("project:delete:info");
        } else {
          setFeedbackByKey("project:delete:error");
        }
      } else if (error.request) {
        setFeedbackByKey("project:delete:error");
        throw new Error("ネットワークエラーが発生しました。");
      } else {
        setFeedbackByKey("project:delete:error");
        throw new Error("エラーが発生しました。");
      }
    }
  };

  return { deleteProject };
}

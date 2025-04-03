import axios from "axios";
import { useFeedbackContext } from "@context/useFeedbackContext";
import { PostCommentFormData, Feedback } from "@sharedTypes/types";

export const useCommentRequest = () => {
  const { setFeedbackByKey } = useFeedbackContext();

  const postCommentProject = async (data: PostCommentFormData, projectId: string): Promise<Feedback> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/comments`,
        {
          comment: {
            content: data.content,
            project_id: projectId
          }
        },
        { withCredentials: true }
      );
      return response.data.comment;
    } catch (error: any) {
      handleCommentError(error, "comment:error");
      throw error;
    }
  };

  const deleteCommentProject = async (projectId: string, commentId: string): Promise<Feedback> => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/comments/${commentId}`,
        { withCredentials: true }
      );
      return response.data.comment;
    } catch (error: any) {
      handleCommentError(error, "deleteComment:error");
      throw error;
    }
  };

  const handleCommentError = (error: any, defaultMessage: string) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        setFeedbackByKey("comment:not_found");
      } else {
        setFeedbackByKey(defaultMessage);
      }
    } else if (error.request) {
      setFeedbackByKey(defaultMessage);
    } else {
      setFeedbackByKey(defaultMessage);
    }
  };

  return { postCommentProject, deleteCommentProject };
};

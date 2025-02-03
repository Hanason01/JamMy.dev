import axios from "axios";
import { useFeedbackContext } from "@context/useFeedbackContext";
import { Like } from "@sharedTypes/types";

export const useLikeRequest = () => {
  const { setFeedbackByKey } = useFeedbackContext();

  // いいね追加関数
  const likeProject = async (projectId: string): Promise<Like> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${projectId}/likes`,
        {},
        { withCredentials: true }
      );
      return response.data.like;
    } catch (error: any) {
      handleLikeError(error, "like:error");
      throw error;
    }
  };

  // いいね解除関数
  const unlikeProject = async (projectId: string, likeId: string): Promise<Like> => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${projectId}/likes/${likeId}`,
        { withCredentials: true }
      );
      return response.data.like;
    } catch (error: any) {
      handleLikeError(error, "unlike:error");
      throw error;
    }
  };

  // エラーハンドリング
  const handleLikeError = (error: any, defaultMessage: string) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        setFeedbackByKey("like:not_found");
      } else {
        setFeedbackByKey(defaultMessage);
      }
    } else if (error.request) {
      setFeedbackByKey(defaultMessage);
    } else {
      setFeedbackByKey(defaultMessage);
    }
  };

  return { likeProject, unlikeProject };
};

import axios from "axios";
import { useFeedbackContext } from "@context/useFeedbackContext";

export const useLikeRequest = () => {
  const { setFeedbackByKey } = useFeedbackContext();

  // いいね追加関数
  const likeProject = async (projectId: string): Promise<void> => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${projectId}/likes`,
        {},
        { withCredentials: true }
      );
    } catch (error: any) {
      handleLikeError(error, "like:error");
    }
  };

  // いいね解除関数
  const unlikeProject = async (projectId: string, likeId: string): Promise<void> => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${projectId}/likes/${likeId}`,
        { withCredentials: true }
      );
    } catch (error: any) {
      handleLikeError(error, "unlike:error");
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
      throw new Error("ネットワークエラーが発生しました。");
    } else {
      setFeedbackByKey(defaultMessage);
      throw new Error("エラーが発生しました。");
    }
  };

  return { likeProject, unlikeProject };
};

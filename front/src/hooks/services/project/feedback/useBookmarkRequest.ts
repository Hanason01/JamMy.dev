import axios from "axios";
import { useFeedbackContext } from "@context/useFeedbackContext";
import { Feedback } from "@sharedTypes/types";

export const useBookmarkRequest = () => {
  const { setFeedbackByKey } = useFeedbackContext();

  const bookmarkProject = async (projectId: string): Promise<Feedback> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${projectId}/bookmarks`,
        {},
        { withCredentials: true }
      );
      return response.data.bookmark;
    } catch (error: any) {
      handleBookmarkError(error, "bookmark:error");
      throw error;
    }
  };

  const unBookmarkProject = async (projectId: string, bookmarkId: string): Promise<Feedback> => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${projectId}/bookmarks/${bookmarkId}`,
        { withCredentials: true }
      );
      return response.data.bookmark;
    } catch (error: any) {
      handleBookmarkError(error, "unBookmark:error");
      throw error;
    }
  };

  const handleBookmarkError = (error: any, defaultMessage: string) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        setFeedbackByKey("bookmark:not_found");
      } else {
        setFeedbackByKey(defaultMessage);
      }
    } else if (error.request) {
      setFeedbackByKey(defaultMessage);
    } else {
      setFeedbackByKey(defaultMessage);
    }
  };

  return { bookmarkProject, unBookmarkProject };
};

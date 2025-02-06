import { InitialComment, EnrichedComment } from "@sharedTypes/types";

// 事前処理関数（isOwnerセット）
export const applyIsOwnerToComments = (comments: InitialComment[]): EnrichedComment[] => {
  if (typeof window === "undefined") {
    return comments.map(comment => ({ ...comment, isOwner: false }));
  }

  const storedUser = localStorage.getItem("authenticatedUser");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  return comments.map(comment => ({
    ...comment,
    isOwner: parsedUser?.id === comment.user.id,
  }));
};

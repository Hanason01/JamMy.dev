import { InitialComment, EnrichedComment } from "@sharedTypes/types";

export const applyIsOwnerToComments = (comments: InitialComment[]): EnrichedComment[] => {
  if (typeof window === "undefined") {
    return comments.map(comment => ({ ...comment, isOwner: false }));
  }

  const storedUser = localStorage.getItem("authenticatedUser");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  return comments.map(comment => ({
    ...comment,
    isOwner: String(parsedUser?.id) === comment.user.id,
  }));
};

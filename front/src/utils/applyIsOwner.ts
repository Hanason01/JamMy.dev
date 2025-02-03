import { InitialProjectData, EnrichedProject } from "@sharedTypes/types";

// 事前処理関数（isOwnerセット）
export const applyIsOwner = (projects: InitialProjectData[]): EnrichedProject[] => {
  if (typeof window === "undefined") {
    // サーバーサイドでは `isOwner: false` にしてそのまま返す
    return projects.map((project) => ({
      ...project,
      isOwner: false,
    }));
  }
  const storedUser = localStorage.getItem("authenticatedUser");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  return projects.map((project) => ({
    ...project,
    isOwner: parsedUser?.id === project.user.id,
  }));
};